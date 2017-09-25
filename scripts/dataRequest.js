//Make some data requests

cafes = [];

function launcher(){

  var kelowna = {
    lat: 49.883810,
    lng: -119.493367
};

map = new google.maps.Map(document.getElementById('mapDisplay'), {
  center: kelowna,
  zoom: 14
});

  var request = {
    location: kelowna,
    radius: 1500,
    type: ['cafe']
  };

  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callBack);

  function callBack(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        var location = {
          name: results[i].name,
          lat: results[i].geometry.location.lat(),
          lng: results[i].geometry.location.lng(),
          status: results[i].opening_hours,
          rating: results[i].rating
        }
        cafes.push(location);
      }
    }
  }
}
