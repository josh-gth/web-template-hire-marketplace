const axios = require('axios');
const { handleError, serialize } = require('../api-util/sdk'); // Assuming you have these helpers
require('dotenv').config();

module.exports = (req, res) => {
  const { deliveryAddress, listingAddress } = req.body;
  const  MAPBOX_ACCESS_TOKEN  = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
//   console.log('api body:', req.body);

  if (!deliveryAddress || !listingAddress) {
    return res.status(400).json({ error: 'Please provide both addresses.' });
  }

  const sdk = { // Assuming sdk-like structure for making API requests
    geocodeAddress: (address) => {
      const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;
      return axios.get(geocodingUrl);
    },
    getDrivingDistance: (coords1, coords2) => {
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords1[0]},${coords1[1]};${coords2[0]},${coords2[1]}?access_token=${MAPBOX_ACCESS_TOKEN}`;
      return axios.get(directionsUrl);
    }
  };

  Promise.all([
    sdk.geocodeAddress(deliveryAddress),
    sdk.geocodeAddress(listingAddress)
  ])
    .then(([geoResponse1, geoResponse2]) => {
      const coords1 = geoResponse1.data.features[0].center;
      const coords2 = geoResponse2.data.features[0].center;

      return sdk.getDrivingDistance(coords1, coords2);
    })
    .then(directionsResponse => {
      const distance = directionsResponse.data.routes[0].distance; // Distance in meters

      res
        .status(200)
        .set('Content-Type', 'application/json')
        .send({ data: { distance: (distance / 1000).toFixed(2) + ' km' } })
        .end();
    })
    .catch(e => {
      handleError(res, e);
    });
};
