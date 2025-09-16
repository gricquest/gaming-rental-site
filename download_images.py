import os
import requests
from urllib.parse import urlparse

# List of image URLs
image_urls = [
    "https://images.booqablecdn.com/w320/assets/c4b6c7a1-937e-4666-afe9-d4e9fdd250b0/461aeabc-8aad-5a8a-ab4f-0489ed321c1e-3843bdcab017b4897f0f4b6a373f28574e0ea61038e01bb3986a725260c90de6.jpg",
    "https://images.booqablecdn.com/w480/assets/c4b6c7a1-937e-4666-afe9-d4e9fdd250b0/461aeabc-8aad-5a8a-ab4f-0489ed321c1e-3843bdcab017b4897f0f4b6a373f28574e0ea61038e01bb3986a725260c90de6.jpg",
    "https://images.booqablecdn.com/w768/assets/c4b6c7a1-937e-4666-afe9-d4e9fdd250b0/461aeabc-8aad-5a8a-ab4f-0489ed321c1e-3843bdcab017b4897f0f4b6a373f28574e0ea61038e01bb3986a725260c90de6.jpg",
    "https://images.booqablecdn.com/w1200/assets/c4b6c7a1-937e-4666-afe9-d4e9fdd250b0/461aeabc-8aad-5a8a-ab4f-0489ed321c1e-3843bdcab017b4897f0f4b6a373f28574e0ea61038e01bb3986a725260c90de6.jpg",
    "https://images.booqablecdn.com/w1680/assets/c4b6c7a1-937e-4666-afe9-d4e9fdd250b0/461aeabc-8aad-5a8a-ab4f-0489ed321c1e-3843bdcab017b4897f0f4b6a373f28574e0ea61038e01bb3986a725260c90de6.jpg",
    "https://images.booqablecdn.com/w2560/assets/c4b6c7a1-937e-4666-afe9-d4e9fdd250b0/461aeabc-8aad-5a8a-ab4f-0489ed321c1e-3843bdcab017b4897f0f4b6a373f28574e0ea61038e01bb3986a725260c90de6.jpg"
]

# Create a directory to save images
os.makedirs("MembershipOptions1_GricQuest_files", exist_ok=True)

# Download and save each image
for url in image_urls:
    parsed = urlparse(url)
    filename = os.path.basename(parsed.path)
    # Extract the size folder (e.g., w320) from the URL path
    parts = parsed.path.split('/')
    size_folder = next((p for p in parts if p.startswith('w')), 'original')
    save_dir = os.path.join("MembershipOptions1_GricQuest_files", size_folder)
    os.makedirs(save_dir, exist_ok=True)
    filepath = os.path.join(save_dir, filename)
    response = requests.get(url)
    if response.status_code == 200:
        with open(filepath, "wb") as f:
            f.write(response.content)
        print(f"✅ Saved: {size_folder}/{filename}")
    else:
        print(f"❌ Failed to download: {url}")