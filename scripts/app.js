//Kelowna cafe locations data model.

var cafes = [{
  name: "Giobean Espresso",
  lat: 49.8912783,
  lng: -119.49691089999999,
  wifi: false,
  rating: 4.6
}, {
  name: "Starbucks",
  lat: 49.8861276,
  lng: -119.4952558,
  wifi: true,
  rating: 4
}, {
  name: "Starbucks",
  lat: 49.8838474,
  lng: -119.4763127,
  wifi: true,
  rating: 4.2
}, {
  name: "The Bohemian Cafe & Catering Co.",
  lat: 49.8865963,
  lng: -119.49284999999998,
  wifi: false,
  rating: 4.4
}, {
  name: "Bike Shop Cafe & Catering Co",
  lat: 49.88984809999999,
  lng: -119.4933848,
  wifi: false,
  rating: 4.2
}, {
  name: "Bean Scene Coffee Works",
  lat: 49.88613429999999,
  lng: -119.4954768,
  wifi: true,
  rating: 4.6
}, {
  name: "Blenz Coffee",
  lat: 49.88618270000001,
  lng: -119.4967734,
  wifi: true,
  rating: 3.9
}, {
  name: "Bread Co.",
  lat: 49.886032,
  lng: -119.49563699999999,
  wifi: false,
  rating: 4
}, {
  name: "Pulp Fiction Coffee House & Robbie Rare Books",
  lat: 49.8855575,
  lng: -119.49536810000001,
  wifi: false,
  rating: 4.7
}, {
  name: "One Cup at a Time",
  lat: 49.88777899999999,
  lng: -119.49206909999998,
  wifi: false,
  rating: 4
}, {
  name: "O-Lake Cafe & Bistro",
  lat: 49.8852643,
  lng: -119.49548579999998,
  wifi: true,
  rating: 4.4
}, {
  name: "Starbucks",
  lat: 49.8856572,
  lng: -119.4893525,
  wifi: true,
  rating: 2.3
}, {
  name: "The Curious Cafe",
  lat: 49.8883963,
  lng: -119.49319919999999,
  wifi: false,
  rating: 4.4
}, {
  name: "Bean Scene Central",
  lat: 49.8815386,
  lng: -119.4758845,
  wifi: true,
  rating: 4.4
}, {
  name: "Kvr Coffee",
  lat: 49.8814689,
  lng: -119.4752484,
  wifi: true,
  rating: 3.2
}, {
  name: "Naked Cafe",
  lat: 49.885174,
  lng: -119.49079799999998,
  wifi: false,
  rating: 4.6
}, {
  name: "Green Leaf Cafe",
  lat: 49.8861779,
  lng: -119.49164630000001,
  wifi: true,
  rating: 4.6
}];
//Just a couple global variables being declared for the map.
var map;

var kelowna = {
  lat: 49.883810,
  lng: -119.493367
};


//A little Ajax request from a fantastic weather API service https://darksky.net/dev
function weatherReport() {

  function convertCelcius(num) {
    result = (num - 32) / 1.8;
    return Math.round(result);
  }

  var darkSkyURL = "https://api.darksky.net/forecast/e62b10a3fbf00ad6c00ee3452d0554fd/" + kelowna.lat + "," + kelowna.lng;
  $.ajax({
    url: darkSkyURL,
    dataType: "jsonp",
    success: function(data) {
      var weatherInput = document.getElementById('weather');

      weatherInput.innerHTML = "<p class='weatherCredit'>" + 'Darksky Weather Report' + '</p>' + '<h2>' + convertCelcius(data.currently.apparentTemperature) +
        '&#8451; ' + '</h2>' + "<span class='weatherSummary'>" + data.currently.summary + '</span>';
    },
    error: function() {
      alert('Darksky Weather request failed');
    }
  });
}

//This function creates the map.
function mapGenerator() {
  map = new google.maps.Map(document.getElementById('mapDisplay'), {
    center: kelowna,
    zoom: 14
  });
}

function mapFail() {
  alert('Looks like there was a error trying to load the map. Please try again later.');
}

//This is the data model function for each cafe location on the map. This is where the marker,info windows and animations are set.

var cafeLocation = function(data) {
  var self = this;
  this.name = data.name;
  this.lat = data.lat;
  this.lng = data.lng;
  this.rating = data.rating;
  this.wifi = data.wifi;
  this.visible = true;

  var wifiStatus;

  if (self.wifi === true) {
    wifiStatus = '<div class="wifiTrue">' + 'Offers Wifi' + '</div>';
  } else {
    wifiStatus = '<div class="wifiFalse">' + 'No Wifi' + '</div>';
  }

  this.contentString = data.name + ' has a rating of ' + data.rating + ' in Kelowna.' + '<p>' + wifiStatus + '</p>';

  this.infowindow = new google.maps.InfoWindow({
    content: self.contentString
  });

  if (this.visible === false) {
    this.marker.setMap(null);
  }

  this.marker = new google.maps.Marker({
    position: new google.maps.LatLng(data.lat, data.lng),
    map: map,
    animation: google.maps.Animation.DROP,
    title: data.name
  });

  this.marker.addListener('click', function() {
    self.infowindow.open(map, self.marker);
    toggleBounce();
  });

  //Full credit to google for this handy bounce toggle function. https://developers.google.com/maps/documentation/javascript/markers#animate
  function toggleBounce() {
    if (self.marker.getAnimation() !== null) {
      self.marker.setAnimation(null);
    } else {
      self.marker.setAnimation(google.maps.Animation.BOUNCE);
      stopBounce(self.marker);
    }
  }
  // Needed to find a way to stop the markers from bouncing. This is simply a timer function adapted from https://stackoverflow.com/questions/7339200/bounce-a-pin-in-google-maps-once
  function stopBounce(marker) {
    setTimeout(function() {
      marker.setAnimation(null);
    }, 2000);
  }
};

// The apps view model, all cafe locations are added to the allCafes array and then displayed based on the filter.
function AppViewModel() {
  var self = this;
  mapGenerator();

  this.allCafes = ko.observableArray([]);
  this.filter = ko.observable(false);

  cafes.forEach(function(objItem) {
    self.allCafes.push(new cafeLocation(objItem));
  });

  var button = document.getElementById('filterButton');
  button.innerHTML = 'Only show cafes with Wifi';

  // Big time praise for the man who put together this article on knockout utility functions. I couldn't have filtered markers without him!
  //http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
  //This filter function checks to see if the Cafes have Wifi.
  self.filterToggle = function() {

    if (self.filter() === false) {
      button.innerHTML = 'Show all Cafes';
      self.filter(true);
    } else if (self.filter() === true) {
      AppViewModel();
      self.filter(false);
    }
  };

  this.filteredCafes = ko.computed(function() {
    if (self.filter() === false) {
      return self.allCafes();
    } else {
      return ko.utils.arrayFilter(self.allCafes(), function(cafeLocation) {
        if (cafeLocation.wifi === false) {
          cafeLocation.marker.setMap(null);
        }
        if (cafeLocation.wifi === true) {
          return cafeLocation;
        }
      });
    }
  }, self);
}

//This function is ran when the google script it loaded and kicks off the app!
function runApp() {
  ko.applyBindings(new AppViewModel());
  weatherReport();
}
