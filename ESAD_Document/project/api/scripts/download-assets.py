import urllib.request
import os

os.makedirs('../frontend/public/videos', exist_ok=True)
os.makedirs('../frontend/public/images/dynamic', exist_ok=True)
os.makedirs('../frontend/public/images/journals', exist_ok=True)

assets = [
    # Video
    ("https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-on-a-curved-road-at-night-42861-large.mp4", "../frontend/public/videos/hero-cinematic.mp4"),
    
    # Exterior
    ("https://images.unsplash.com/photo-1600712242805-5f78671b24da?auto=format&fit=crop&w=2560&q=95", "../frontend/public/images/dynamic/bugatti_exterior.jpg"),
    
    # Hotspots
    ("https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=100", "../frontend/public/images/dynamic/hotspot_engine.jpg"),
    ("https://images.unsplash.com/photo-1620023602157-194161a052ff?auto=format&fit=crop&w=800&q=100", "../frontend/public/images/dynamic/hotspot_brakes.jpg"),
    ("https://images.unsplash.com/photo-1549429158-9beab4b13876?auto=format&fit=crop&w=800&q=100", "../frontend/public/images/dynamic/hotspot_chassis.jpg"),
    ("https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9d?auto=format&fit=crop&w=800&q=100", "../frontend/public/images/dynamic/hotspot_aero.jpg"),
    
    # Specs
    ("https://images.unsplash.com/photo-1600712242805-5f78671b24da?auto=format&fit=crop&w=2000&q=100", "../frontend/public/images/dynamic/spec_carbon.jpg"),
    ("https://images.unsplash.com/photo-1525609004556-c46dce31b4ad?auto=format&fit=crop&w=2000&q=100", "../frontend/public/images/dynamic/spec_blue.jpg"),
    ("https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=2000&q=100", "../frontend/public/images/dynamic/spec_silver.jpg"),

    # Journals
    ("https://images.unsplash.com/photo-1600712242805-5f78671b24da?auto=format&fit=crop&w=800&q=80", "../frontend/public/images/journals/journal_1.jpg"),
    ("https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80", "../frontend/public/images/journals/journal_2.jpg"),
    ("https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80", "../frontend/public/images/journals/journal_3.jpg"),
]

for url, path in assets:
    if os.path.exists(path):
        print(f"Skipping {path}, already exists.")
        continue
    print(f"Downloading {url} to {path}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
        with urllib.request.urlopen(req) as response, open(path, 'wb') as out_file:
            out_file.write(response.read())
        print("Success.")
    except Exception as e:
        print(f"Failed to download {url}: {e}")
