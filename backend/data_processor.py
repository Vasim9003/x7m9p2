import requests
import pandas as pd

def process_wind_data():
    # Elexon /stream endpoints use 'publishDateTimeFrom' and 'publishDateTimeTo'
    stream_params = {
        "publishDateTimeFrom": "2026-01-01T00:00:00Z",
        "publishDateTimeTo": "2026-01-03T00:00:00Z"
    }
    
    # 1. Fetch Actuals from /stream
    print("Fetching Actuals (FUELHH/stream)...")
    actuals_url = "https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream"
    res_actuals = requests.get(actuals_url, params=stream_params)
    
    # /stream returns a direct list, so no need for .get('data', [])
    actuals_data = res_actuals.json()
    df_actuals = pd.DataFrame(actuals_data)
    
    # 2. Fetch Forecasts from /stream
    print("Fetching Forecasts (WINDFOR/stream)...")
    forecasts_url = "https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream"
    res_forecasts = requests.get(forecasts_url, params=stream_params)
    
    forecasts_data = res_forecasts.json()
    df_forecasts = pd.DataFrame(forecasts_data)
    
    if df_actuals.empty or df_forecasts.empty:
        print("Error: One of the datasets is empty.")
        return

    # 3. Filter Actuals for 'WIND'
    if 'fuelType' in df_actuals.columns:
        df_actuals = df_actuals[df_actuals['fuelType'] == 'WIND']
    
    # Select columns and rename
    df_actuals = df_actuals[['startTime', 'generation']].rename(columns={'generation': 'actual_generation'})
    df_forecasts = df_forecasts[['startTime', 'publishTime', 'generation']].rename(columns={'generation': 'forecast_generation'})
    
    # Debug Date Matching
    print("\nSample startTime from Actuals:")
    print(df_actuals['startTime'].head(2).tolist())
    print("Sample startTime from Forecasts:")
    print(df_forecasts['startTime'].head(2).tolist())
    
    # 4. Merge datasets
    print("\nMerging datasets on startTime...")
    merged_df = pd.merge(df_actuals, df_forecasts, on='startTime', how='inner')
    
    # 5. Calculate Error (Actual - Forecast)
    if not merged_df.empty:
        merged_df['error_mw'] = merged_df['actual_generation'] - merged_df['forecast_generation']
        merged_df['error_mw'] = merged_df['error_mw'].round(2)
    
    print(f"\nTotal merged records: {len(merged_df)}")
    
    if not merged_df.empty:
        print("Sample Data (First 5 rows):")
        print(merged_df.head())
    else:
        print("Still 0 merged records. Data ranges might not overlap.")

if __name__ == "__main__":
    process_wind_data()