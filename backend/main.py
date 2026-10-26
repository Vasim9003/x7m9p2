from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import pandas as pd

app = FastAPI()

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (update this later for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/wind-data")
def get_wind_data(start_date: str = "2026-01-01", end_date: str = "2026-01-31"):
    start_time = f"{start_date}T00:00:00Z"
    end_time = f"{end_date}T23:59:59Z"
    
    stream_params = {
        "publishDateTimeFrom": start_time,
        "publishDateTimeTo": end_time
    }
    
    # 1. Fetch Actuals
    res_actuals = requests.get("https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream", params=stream_params)
    df_actuals = pd.DataFrame(res_actuals.json())
    
    # 2. Fetch Forecasts
    res_forecasts = requests.get("https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream", params=stream_params)
    df_forecasts = pd.DataFrame(res_forecasts.json())
    
    if df_actuals.empty or df_forecasts.empty:
        return {"status": "error", "message": "No data found for the given dates."}

    # 3. Process & Group Actuals (Filter WIND, then group by 30-min interval)
    if 'fuelType' in df_actuals.columns:
        df_actuals = df_actuals[df_actuals['fuelType'] == 'WIND']
    df_actuals = df_actuals[['startTime', 'generation']].rename(columns={'generation': 'actual_generation'})
    df_actuals = df_actuals.groupby('startTime', as_index=False).mean()

    # 4. Process & Group Forecasts (Group by 30-min interval)
    df_forecasts = df_forecasts[['startTime', 'generation']].rename(columns={'generation': 'forecast_generation'})
    df_forecasts = df_forecasts.groupby('startTime', as_index=False).mean()

    # 5. Merge both datasets using LEFT JOIN to keep all 48 half-hour slots
    merged_df = pd.merge(df_actuals, df_forecasts, on='startTime', how='left')
    merged_df = merged_df.sort_values('startTime')
    
    # Forward fill (ffill) to copy the hourly forecast to the next 30-min slot
    merged_df['forecast_generation'] = merged_df['forecast_generation'].ffill().bfill()
    
    # 6. Calculate Error and Round values
    merged_df['error_mw'] = (merged_df['actual_generation'] - merged_df['forecast_generation']).round(2)
    merged_df['actual_generation'] = merged_df['actual_generation'].round(2)
    merged_df['forecast_generation'] = merged_df['forecast_generation'].round(2)
    
    # drops null values 
    merged_df = merged_df.dropna()
    
    mae = abs(merged_df['error_mw']).mean().round(2)
    
    return {
        "status": "success",
        "total_records": len(merged_df),
        "mean_absolute_error": mae,
        "data": merged_df.to_dict(orient='records')
    }