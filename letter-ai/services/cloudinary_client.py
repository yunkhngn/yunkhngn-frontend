import cloudinary
import cloudinary.uploader
import os


def configure():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    )


def upload_reveal_map(image_bytes: bytes, public_id: str) -> str:
    """Upload grayscale reveal map PNG to Cloudinary. Returns the URL."""
    configure()
    result = cloudinary.uploader.upload(
        image_bytes,
        public_id=f"letters/reveal-maps/{public_id}",
        resource_type="image",
        format="png",
        overwrite=True,
    )
    return result["secure_url"]
