const axios = require("axios");

async function getCoordinatesFromZipcode(zipcode) {
  try {
    if (!zipcode || zipcode.length < 5) {
      console.warn("Invalid zipcode:", zipcode);
      return null;
    }

    const response = await axios.get(`https://api.zippopotam.us/in/${zipcode}`);

    if (!response.data || !Array.isArray(response.data.places)) {
      console.warn(" No places found in Zippopotam response for:", zipcode);
      return null;
    }

    const place = response.data.places[0];
    return {
      latitude: parseFloat(place.latitude),
      longitude: parseFloat(place.longitude),
    };
  } catch (err) {
    console.error(" Error fetching coordinates (Zippopotam):", err.message);
    return null;
  }
}

async function getCoordinatesFromPincode(pincode) {
  try {
    if (!pincode || pincode.length < 5) {
      console.warn(" Invalid pincode:", pincode);
      return null;
    }

    console.log("🌍 Fetching coordinates for:", pincode);

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          postalcode: pincode,
          country: "India",
          format: "json",
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "HyperlocalMarketplace/1.0 (contact@yourapp.com)",
        },
      }
    );

    if (!Array.isArray(response.data) || response.data.length === 0) {
      console.warn(" No location found in Nominatim for:", pincode);
      return null;
    }

    const locationData = response.data[0];
    const { lat, lon, address } = locationData;

    if (!lat || !lon || !address) {
      console.warn(
        "Incomplete data from Nominatim for:",
        pincode,
        locationData
      );
      return null;
    }

    const city = address.city || address.town || address.village || address.county;
    const country = address.country;

    if (!city || !country) {
      console.warn(
        ` Could not determine city or country for ${pincode}. Address found:`,
        address
      );
    }

    const result = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      city: city || null,
      country: country || null,
    };

    console.log(` Found location for ${pincode}:`, result);
    return result;
    
  } catch (err) {
    console.error(
      ` Error fetching location (Nominatim) for ${pincode}:`,
      err.message
    );
    return null;
  }
}

module.exports = {
  getCoordinatesFromZipcode,
  getCoordinatesFromPincode,
};
