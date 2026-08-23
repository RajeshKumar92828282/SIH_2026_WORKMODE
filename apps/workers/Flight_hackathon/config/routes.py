import re
from typing import Optional, Tuple

# Mapping of known Indian cities to their primary airport IATA codes
CITY_TO_IATA = {
    "delhi": "DEL",
    "new delhi": "DEL",
    "mumbai": "BOM",
    "bombay": "BOM",
    "bangalore": "BLR",
    "bengaluru": "BLR",
    "kolkata": "CCU",
    "calcutta": "CCU",
    "hyderabad": "HYD",
    "chennai": "MAA",
    "madras": "MAA",
    "cochin": "COK",
    "kochi": "COK",
    "goa": "GOI",
    "ahmedabad": "AMD",
    "pune": "PNQ",
    "jaipur": "JAI",
    "lucknow": "LKO",
    "patna": "PAT",
    "guwahati": "GAU",
    "bhubaneswar": "BBI",
    "bagdogra": "IXB",
    "vizag": "VTZ",
    "visakhapatnam": "VTZ",
    "ranchi": "IXR",
    "raipur": "RPR",
    "srinagar": "SXR",
    "port blair": "IXZ",
    "amritsar": "ATQ",
    "coimbatore": "CJB",
    "indore": "IDR",
    "trichy": "TRZ",
    "madurai": "IXM",
    "varanasi": "VNS",
    "dehradun": "DED",
    "chandigarh": "IXC",
    "mopa": "GOX",
}

# Regex to check if a code is a valid 3-letter alphabetic string
IATA_REGEX = re.compile(r"^[A-Z]{3}$", re.IGNORECASE)

def normalize_airport_code(value: Optional[str]) -> Optional[str]:
    """
    Standardizes airport codes. Converts city names to IATA codes if known.
    
    Args:
        value: The raw airport code or city name.
        
    Returns:
        Normalized 3-letter IATA code, or None if invalid or missing.
    """
    if value is None:
        return None
        
    if not isinstance(value, str):
        value = str(value)
        
    cleaned = value.strip().lower()
    
    if cleaned in ("nan", "null", "none", ""):
        return None
        
    # Check if it is a known city name
    if cleaned in CITY_TO_IATA:
        return CITY_TO_IATA[cleaned]
        
    # Check if it is a valid 3-letter IATA code
    if IATA_REGEX.match(cleaned):
        return cleaned.upper()
        
    # If not recognized and not 3-letter alphabetic, we cannot confidently normalize it
    return None

def normalize_route(origin: Optional[str], destination: Optional[str]) -> Optional[str]:
    """
    Combines normalized origin and destination into canonical format: ORIGIN-DESTINATION.
    
    Args:
        origin: Normalized or raw origin airport/city.
        destination: Normalized or raw destination airport/city.
        
    Returns:
        Canonical route string (e.g. "DEL-BOM") or None if either is missing.
    """
    norm_origin = normalize_airport_code(origin)
    norm_dest = normalize_airport_code(destination)
    
    if norm_origin and norm_dest:
        return f"{norm_origin}-{norm_dest}"
        
    return None

def parse_route_string(route_str: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
    """
    Parses a single route string and attempts to extract origin and destination.
    Handles separators like: DEL-BOM, DEL/BOM, DEL -> BOM, DEL to BOM, DEL_BOM, DEL → BOM
    
    Args:
        route_str: The raw route string.
        
    Returns:
        Tuple of (origin_code, destination_code)
    """
    if not route_str or not isinstance(route_str, str):
        return None, None
        
    # Standardize separator representations to a simple dash
    cleaned = re.sub(r"\s*-\s*", "-", route_str)
    cleaned = re.sub(r"\s*/\s*", "-", cleaned)
    cleaned = re.sub(r"\s*(?:->|→|to)\s*", "-", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s+", "-", cleaned)
    
    # Split the route string
    parts = [p.strip() for p in cleaned.split("-") if p.strip()]
    
    if len(parts) >= 2:
        # First and last elements are assumed to be origin and destination
        origin = normalize_airport_code(parts[0])
        destination = normalize_airport_code(parts[-1])
        return origin, destination
        
    return None, None
