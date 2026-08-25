from datetime import date, datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator

from config.routes import normalize_airport_code, parse_route_string
from config.airlines import normalize_airline_name

class AirfareObservation(BaseModel):
    """
    Pydantic V2 model representing a single canonical airfare observation record.
    Ensures structural and data validation for the dataset pipeline.
    """
    record_id: str
    dataset_source: str
    
    observation_date: Optional[date] = None
    journey_date: Optional[date] = None
    
    origin: Optional[str] = None
    destination: Optional[str] = None
    route: Optional[str] = None
    
    airline: Optional[str] = None
    flight_number: Optional[str] = None
    
    cabin_class: str = "UNKNOWN"
    
    departure_time: Optional[str] = None
    arrival_time: Optional[str] = None
    
    stops: Optional[int] = Field(None, ge=0)
    duration_minutes: Optional[float] = Field(None, gt=0)
    
    advance_days: Optional[int] = Field(None, ge=0)
    advance_window: Optional[str] = None
    
    base_fare: Optional[float] = Field(None, ge=0)
    taxes: Optional[float] = Field(None, ge=0)
    fees: Optional[float] = Field(None, ge=0)
    total_fare: Optional[float] = Field(None, ge=0)
    price: float = Field(..., gt=0)  # Price is required and must be positive
    
    is_outlier: bool = False
    quality_status: str = "VALID"
    quality_notes: Optional[str] = None
    
    source_row_number: int = Field(..., ge=1)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )

    @field_validator("origin", "destination", mode="before")
    @classmethod
    def validate_airport(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        norm = normalize_airport_code(v)
        if norm is None and str(v).strip().lower() not in ("", "nan", "null", "none"):
            raise ValueError(f"Invalid airport code or city name: '{v}'")
        return norm

    @field_validator("airline", mode="before")
    @classmethod
    def validate_airline(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        return normalize_airline_name(v)

    @field_validator("cabin_class", mode="before")
    @classmethod
    def validate_cabin_class(cls, v: Optional[str]) -> str:
        if v is None:
            return "UNKNOWN"
        val = str(v).strip().upper()
        if "ECONOMY" in val:
            if "PREMIUM" in val:
                return "PREMIUM_ECONOMY"
            return "ECONOMY"
        if "BUSINESS" in val:
            return "BUSINESS"
        if "FIRST" in val:
            return "FIRST"
        if val in ("PREMIUM_ECONOMY", "ECONOMY", "BUSINESS", "FIRST", "UNKNOWN"):
            return val
        return "UNKNOWN"

    @model_validator(mode="after")
    def validate_route_and_airports(self) -> "AirfareObservation":
        # Resolve route from origin and destination if missing
        if self.origin and self.destination:
            expected_route = f"{self.origin}-{self.destination}"
            if not self.route:
                self.route = expected_route
            elif self.route != expected_route:
                # Standardize to origin-destination match
                self.route = expected_route
        elif self.route:
            # If route exists but origin/destination are missing, try parsing route
            orig, dest = parse_route_string(self.route)
            if orig and dest:
                if not self.origin:
                    self.origin = orig
                if not self.destination:
                    self.destination = dest
                self.route = f"{orig}-{dest}"
                
        # Validate that if route exists, it follows the ORIGIN-DESTINATION format
        if self.route:
            parts = self.route.split("-")
            if len(parts) != 2 or not all(len(p) == 3 and p.isupper() for p in parts):
                # Invalid route format, but let's see if we can repair it
                orig, dest = parse_route_string(self.route)
                if orig and dest:
                    self.origin = orig
                    self.destination = dest
                    self.route = f"{orig}-{dest}"
                else:
                    raise ValueError(f"Route '{self.route}' does not match expected format 'ORIGIN-DESTINATION'")
                    
        return self
