import { EmissionsData } from '../types/game'

// Regional solar production factors by ZIP first digit
const SOLAR_REGIONAL_FACTORS: Record<string, number> = {
  '0': 0.85, // Northeast
  '1': 0.90, // Northeast
  '2': 0.95, // Southeast
  '3': 1.00, // Southeast
  '4': 1.05, // Southeast
  '5': 1.10, // Southwest
  '6': 1.15, // Southwest
  '7': 1.10, // Southwest
  '8': 1.05, // Northwest
  '9': 1.00  // Northwest
}

// Top 30 US airports by passenger traffic, ordered alphabetically
const AIRPORTS = {
  'ATL': { name: 'Atlanta (ATL)', lat: 33.6407, lon: -84.4277 },
  'AUS': { name: 'Austin (AUS)', lat: 30.1975, lon: -97.6664 },
  'BNA': { name: 'Nashville (BNA)', lat: 36.1263, lon: -86.6774 },
  'BOS': { name: 'Boston (BOS)', lat: 42.3656, lon: -71.0096 },
  'BWI': { name: 'Baltimore (BWI)', lat: 39.1754, lon: -76.6682 },
  'CLT': { name: 'Charlotte (CLT)', lat: 35.2144, lon: -80.9473 },
  'CVG': { name: 'Cincinnati (CVG)', lat: 39.0489, lon: -84.6678 },
  'DCA': { name: 'Washington Reagan (DCA)', lat: 38.8512, lon: -77.0402 },
  'DEN': { name: 'Denver (DEN)', lat: 39.8561, lon: -104.6737 },
  'DFW': { name: 'Dallas (DFW)', lat: 32.8968, lon: -97.0380 },
  'DTW': { name: 'Detroit (DTW)', lat: 42.2162, lon: -83.3554 },
  'EWR': { name: 'Newark (EWR)', lat: 40.6895, lon: -74.1745 },
  'FLL': { name: 'Fort Lauderdale (FLL)', lat: 26.0742, lon: -80.1506 },
  'IAD': { name: 'Washington Dulles (IAD)', lat: 38.9531, lon: -77.4565 },
  'IAH': { name: 'Houston (IAH)', lat: 29.9902, lon: -95.3368 },
  'JFK': { name: 'New York (JFK)', lat: 40.6413, lon: -73.7781 },
  'LAS': { name: 'Las Vegas (LAS)', lat: 36.0840, lon: -115.1537 },
  'LAX': { name: 'Los Angeles (LAX)', lat: 33.9416, lon: -118.4085 },
  'LGA': { name: 'New York LaGuardia (LGA)', lat: 40.7769, lon: -73.8740 },
  'MCI': { name: 'Kansas City (MCI)', lat: 39.2976, lon: -94.7139 },
  'MCO': { name: 'Orlando (MCO)', lat: 28.4312, lon: -81.3081 },
  'MIA': { name: 'Miami (MIA)', lat: 25.7932, lon: -80.2906 },
  'MSP': { name: 'Minneapolis (MSP)', lat: 44.8848, lon: -93.2223 },
  'ORD': { name: 'Chicago (ORD)', lat: 41.9786, lon: -87.9048 },
  'PDX': { name: 'Portland (PDX)', lat: 45.5898, lon: -122.5951 },
  'PHX': { name: 'Phoenix (PHX)', lat: 33.4484, lon: -112.0740 },
  'PIT': { name: 'Pittsburgh (PIT)', lat: 40.4915, lon: -80.2329 },
  'RDU': { name: 'Raleigh-Durham (RDU)', lat: 35.8801, lon: -78.7880 },
  'SEA': { name: 'Seattle (SEA)', lat: 47.4502, lon: -122.3088 },
  'SFO': { name: 'San Francisco (SFO)', lat: 37.6213, lon: -122.3790 },
  'SLC': { name: 'Salt Lake City (SLC)', lat: 40.7899, lon: -111.9791 }
}

// Calculate great circle distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Clamp value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Format emissions number: round up to nearest whole number and add commas for numbers over 1000
function formatEmissionsNumber(value: number): number {
  return Math.ceil(value)
}

// Format emissions display: add commas for numbers over 1000
function formatEmissionsDisplay(value: number): string {
  const roundedValue = Math.ceil(value)
  return roundedValue >= 1000 ? roundedValue.toLocaleString() : roundedValue.toString()
}

// Export the formatting function for use in other components
export function formatEmissionsForDisplay(value: number): string {
  const roundedValue = Math.ceil(value)
  return roundedValue >= 1000 ? roundedValue.toLocaleString() : roundedValue.toString()
}

export function calculateEmissions(locationId: string, data: any): EmissionsData {
  const timestamp = Date.now()
  
  switch (locationId) {
    case 'house':
    case 'suburban-house':
      return calculateHouseEmissions(data, timestamp)
    case 'garage':
      return calculateGarageEmissions(data, timestamp)
    case 'coffee':
    case 'coffee-shop':
      return calculateCoffeeShopEmissions(data, timestamp)
    case 'grocery':
    case 'grocery-store':
      return calculateGroceryStoreEmissions(data, timestamp)
    case 'airport':
      return calculateAirportEmissions(data, timestamp)
    default:
      throw new Error(`Unknown location: ${locationId}`)
  }
}

function calculateHouseEmissions(data: any, timestamp: number): EmissionsData {
  const { zipCode, squareFootage } = data
  const zipFirstDigit = zipCode.toString()[0]
  const regionalFactor = SOLAR_REGIONAL_FACTORS[zipFirstDigit] || 1.0
  
  // Calculate emissions based on EPA data for 2000 sq ft house
  // Electricity: 12,194 kWh/year for 2000 sq ft, scale proportionally
  const baseElectricityUsage = 12194 // kWh/year for 2000 sq ft
  const scaledElectricityUsage = baseElectricityUsage * (squareFootage / 2000)
  
  // Grid emissions factor: 0.92 lbs CO2/kWh = 0.417 kg CO2/kWh (EPA average)
  // Including transmission and distribution losses
  const gridEmissionsFactor = 0.417
  const electricityEmissions = scaledElectricityUsage * gridEmissionsFactor
  
  // Natural gas: 39,319 cubic feet/year for 2000 sq ft, scale proportionally
  const baseGasUsage = 39319 // cubic feet/year for 2000 sq ft
  const scaledGasUsage = baseGasUsage * (squareFootage / 2000)
  
  // Natural gas emissions: 0.0549 kg CO2/cubic foot
  const gasEmissionsFactor = 0.0549
  const gasEmissions = scaledGasUsage * gasEmissionsFactor
  
  // Total annual emissions
  const totalEmissions = electricityEmissions + gasEmissions
  
  // Calculate solar savings potential
  // Base system size: 5 kW at 2,000 sqft, scale proportionally
  const baseSize = 5 * (squareFootage / 2000)
  const systemSize = clamp(baseSize, 2, 10) // Clamp between 2-10 kW
  
  // Annual production: 1,400 kWh per kW-year × regional factor
  const annualProduction = systemSize * 1400 * regionalFactor
  
  // Solar savings: replaces grid electricity, reducing emissions
  // This represents the carbon reduction from solar installation
  const solarSavings = annualProduction * gridEmissionsFactor
  
  // Calculate what the new emissions would be with solar
  const remainingElectricityEmissions = Math.max(0, electricityEmissions - solarSavings)
  const emissionsWithSolar = remainingElectricityEmissions + gasEmissions
  
  // Debug logging
  console.log('House Emissions Calculation:', {
    squareFootage,
    zipCode,
    regionalFactor,
    scaledElectricityUsage: Math.round(scaledElectricityUsage),
    electricityEmissions: Math.round(electricityEmissions),
    scaledGasUsage: Math.round(scaledGasUsage),
    gasEmissions: Math.round(gasEmissions),
    totalEmissions: Math.round(totalEmissions),
    solarSavings: Math.round(solarSavings)
  })
  
  return {
    locationId: 'suburban-house',
    locationName: 'House',
    inputs: { zipCode, squareFootage },
    emissions: formatEmissionsNumber(totalEmissions),
    savings: formatEmissionsNumber(solarSavings),
    unit: 'kg CO2e',
    timeframe: 'per year',
    tips: [
      'Get a quote for a right-sized solar system',
      'Improve insulation and air sealing to reduce energy consumption',
      'Consider energy-efficient appliances and LED lighting',
      'Use a programmable thermostat to optimize heating/cooling',
      `A ${Math.round(systemSize * 10) / 10} kW solar system could reduce your electricity emissions by ${formatEmissionsNumber(solarSavings)} kg CO2/year`
    ],
    timestamp
  }
}

function calculateGarageEmissions(data: any, timestamp: number): EmissionsData {
  const { milesPerWeek } = data
  
  // Convert weekly to annual: 52 weeks per year
  const milesPerYear = milesPerWeek * 52
  
  // ICE baseline: 0.404 kg CO2e/mile
  const iceEmissions = milesPerYear * 0.404
  const hybridEmissions = milesPerYear * 0.200
  const evEmissions = milesPerYear * 0.080
  
  const hybridSavings = iceEmissions - hybridEmissions
  const evSavings = iceEmissions - evEmissions
  
  return {
    locationId: 'garage',
    locationName: 'Garage',
    inputs: { milesPerWeek },
    emissions: formatEmissionsNumber(iceEmissions),
    savings: formatEmissionsNumber(Math.max(hybridSavings, evSavings)),
    unit: 'kg CO2e',
    timeframe: 'per year',
    tips: [
      'Consider public transit, carpooling, or remote work days',
      'Walk or bike short trips when feasible',
      'Switch to an electric or hybrid vehicle for significant emissions reduction'
    ],
    timestamp
  }
}

function calculateCoffeeShopEmissions(data: any, timestamp: number): EmissionsData {
  const { daysPerWeek } = data
  
  // Convert weekly to annual: 52 weeks per year
  const daysPerYear = daysPerWeek * 52
  
  // 1 cup/visit; 0.10 kg CO2e/cup (cup + lid)
  const annualEmissions = daysPerYear * 0.10
  
  // Savings if using reusable cup 80-100% of visits
  const reusableSavings = annualEmissions * 0.9 // 90% reduction
  
  return {
    locationId: 'coffee-shop',
    locationName: 'Coffee Shop',
    inputs: { daysPerWeek },
    emissions: formatEmissionsNumber(annualEmissions),
    savings: formatEmissionsNumber(reusableSavings),
    unit: 'kg CO2e',
    timeframe: 'per year',
    tips: [
      'Bring a reusable cup; many shops offer a discount',
      'Consider making coffee at home for additional savings',
      'Support cafes that use compostable or reusable materials'
    ],
    timestamp
  }
}

function calculateGroceryStoreEmissions(data: any, timestamp: number): EmissionsData {
  const { nightsPerWeek } = data
  
  // Convert weekly to annual: 52 weeks per year
  const nightsPerYear = nightsPerWeek * 52
  
  // 1 serving/night (~0.11 kg beef) × 27 kg CO2e/kg ≈ 3.0 kg CO2e/serving
  const annualEmissions = nightsPerYear * 3.0
  
  // Savings if swapping to poultry/plant-based (70-90% reduction)
  const plantBasedSavings = annualEmissions * 0.8 // 80% reduction
  
  return {
    locationId: 'grocery-store',
    locationName: 'Grocery Store',
    inputs: { nightsPerWeek },
    emissions: formatEmissionsNumber(annualEmissions),
    savings: formatEmissionsNumber(plantBasedSavings),
    unit: 'kg CO2e',
    timeframe: 'per year',
    tips: [
      'Try a meatless Monday',
      'Batch-cook plant-forward meals to reduce friction',
      'Explore local farmers markets for seasonal produce',
      'Consider meal planning to reduce food waste'
    ],
    timestamp
  }
}

function calculateAirportEmissions(data: any, timestamp: number): EmissionsData {
  const { flightsPerYear, origin, destination } = data
  
  const originAirport = AIRPORTS[origin as keyof typeof AIRPORTS]
  const destAirport = AIRPORTS[destination as keyof typeof AIRPORTS]
  
  if (!originAirport || !destAirport) {
    throw new Error('Invalid airport code')
  }
  
  // Calculate distance (one-way)
  const oneWayDistance = calculateDistance(
    originAirport.lat, originAirport.lon,
    destAirport.lat, destAirport.lon
  )
  
  // Assume roundtrip flights (double the distance)
  const roundtripDistance = oneWayDistance * 2
  
  // Factor = 0.18 kg CO2e/passenger-mile (includes high-altitude effects)
  const emissionsFactor = 0.18
  const tripEmissions = roundtripDistance * emissionsFactor
  
  // Calculate annual emissions based on frequency
  const annualEmissions = tripEmissions * flightsPerYear
  
  // Potential savings through carbon offsetting (realistic 10-20% of emissions)
  const offsetSavings = annualEmissions * 0.15 // 15% through offsets
  
  return {
    locationId: 'airport',
    locationName: 'Airport',
    inputs: { flightsPerYear, origin, destination },
    emissions: formatEmissionsNumber(annualEmissions),
    savings: formatEmissionsNumber(offsetSavings),
    unit: 'kg CO2e',
    timeframe: 'per year',
    tips: [
      'Bundle trips and choose nonstop flights when possible',
      'Consider rail for regional travel where available',
      'Purchase carbon offsets for unavoidable flights',
      'Combine multiple destinations into single trips',
      'Choose airlines with newer, more fuel-efficient aircraft'
    ],
    timestamp
  }
}
