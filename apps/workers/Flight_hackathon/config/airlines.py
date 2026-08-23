import re
from typing import Optional

# Canonical airline mapping
# Keys are lowercase, whitespace-collapsed strings.
AIRLINE_ALIASES = {
    # IndiGo
    "indigo": "IndiGo",
    "indigo airlines": "IndiGo",
    
    # Air India
    "air india": "Air India",
    "airindia": "Air India",
    
    # Air India Express & AIX Connect / AirAsia India
    "air india express": "Air India Express",
    "airindia express": "Air India Express",
    "airasia india": "Air India Express",
    "air asia": "Air India Express",
    "aix connect": "Air India Express",
    
    # SpiceJet
    "spicejet": "SpiceJet",
    "spice jet": "SpiceJet",
    
    # Akasa Air
    "akasa air": "Akasa Air",
    "akasa": "Akasa Air",
    
    # Vistara
    "vistara": "Vistara",
    "tata sia airlines": "Vistara",
    
    # Go First / Go Air
    "go first": "Go First",
    "gofirst": "Go First",
    "go air": "Go First",
    "goair": "Go First",
    
    # Alliance Air
    "alliance air": "Alliance Air",
    "alliance": "Alliance Air",
    
    # Star Air
    "star air": "Star Air",
}

def normalize_airline_name(value: Optional[str]) -> Optional[str]:
    """
    Standardizes airline names to a canonical representation.
    
    Args:
        value: The raw airline name.
        
    Returns:
        Normalized airline name, or None if missing or empty.
    """
    if value is None:
        return None
        
    if not isinstance(value, str):
        value = str(value)
        
    # Standardize whitespace: strip and collapse multiple spaces to a single space
    cleaned = value.strip()
    cleaned = re.sub(r"\s+", " ", cleaned)
    
    if not cleaned or cleaned.lower() in ("nan", "null", "none"):
        return None
        
    normalized_key = cleaned.lower()
    
    # Check alias dictionary
    if normalized_key in AIRLINE_ALIASES:
        return AIRLINE_ALIASES[normalized_key]
        
    # If it matches a pattern like "Air India Express <something>", try matching prefix
    # or just return the whitespace-cleaned version for unknown airlines.
    # We want to be safe and capitalize the words as a fallback.
    return cleaned.title()
