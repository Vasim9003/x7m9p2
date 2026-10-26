import requests

# Actual generation (FUELHH) API URL
url = "https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH"

# Requesting data for January 1, 2026 (1-day test)
params = {
    "publishTimeFrom": "2026-01-01T00:00:00Z",
    "publishTimeTo": "2026-01-02T00:00:00Z"
}

print("Fetching data from Elexon API...")
response = requests.get(url, params=params)

if response.status_code == 200:
    data = response.json()
    print("Success! Data received. First 2 records:")
    # Printing only the first 2 records for verification
    print(data['data'][0:2] if 'data' in data else data[0:2]) 
else:
    print(f"Error: {response.status_code}")
    print(response.text)