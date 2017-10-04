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

//Global variables being declared for the map and foursquare API.
var map;
var clientID;
var clientSecret;

var kelowna = {
  lat: 49.883810,
  lng: -119.493367
};

//This function creates the Google map.
function mapGenerator() {
  map = new google.maps.Map(document.getElementById('mapDisplay'), {
    center: kelowna,
    zoom: 14
  });
}

function failAlert() {
  alert('Looks like something went wrong here :(');
}

//This is the data model function for each cafe location on the map. This is where the marker,info windows and animations are set.
var cafeLocation = function(data) {
  var self = this;
  this.name = data.name;
  this.lat = data.lat;
  this.lng = data.lng;
  this.rating = data.rating;
  this.wifi = data.wifi;
  this.phone = "";

  var wifiStatus;
  if (self.wifi === true) {
    wifiStatus = '<div class="wifiTrue">' + 'Offers Wifi' + '</div>';
  } else {
    wifiStatus = '<div class="wifiFalse">' + 'No Wifi' + '</div>';
  }

  //foursquare API call
  var foursquareSearch = "https://api.foursquare.com/v2/venues/search?ll=" + this.lat + "," + this.lng + "&client_id=" + clientID + '&client_secret=' + clientSecret + '&v=20170303' + '&query=' + this.name;
  function addressPull() {
    return $.ajax({
      dataType: 'json',
      url: foursquareSearch,
      data: data.response,
    });
  }

//Creates a new marker and places it on the map.
  this.marker = new google.maps.Marker({
    position: new google.maps.LatLng(data.lat, data.lng),
    map: map,
    animation: google.maps.Animation.DROP,
    title: data.name
  });

//Creates a blank info window on each marker and waits until its clicked to insert data from data model and foursquare.
  this.infowindow = new google.maps.InfoWindow({});
  this.marker.addListener('click', function() {
    $.when(addressPull()).done(function(data) {
      if (data.response.venues[0].contact.formattedPhone === undefined) {
        self.phone = 'No number in database :(';
      } else {
        self.phone = data.response.venues[0].contact.formattedPhone;
      }
      self.infowindow.setContent(self.name + ' has a rating of ' + self.rating + ' in Kelowna.' + '<p>' + wifiStatus + '</p>' + 'Phone: ' + self.phone);
    });
    self.toggleBounce();
  });

  //Handy dandy google bounce function. https://developers.google.com/maps/documentation/javascript/markers#animate
  this.toggleBounce = function() {
    if (self.marker.getAnimation() !== null) {
      self.marker.setAnimation(null);
    } else {
      self.marker.setAnimation(google.maps.Animation.BOUNCE);
      self.infowindow.open(map, self.marker);
      stopBounce(self.marker);
    }
  };

  //Stops the markers from bouncing. This is simply a timer function adapted from https://stackoverflow.com/questions/7339200/bounce-a-pin-in-google-maps-once
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

  clientID = '1RPARC1P5UUSMHYUA1UZUXZW2UYSFWE0DZF5UMP2ELCML5RX';
  clientSecret = 'N5W3RPZTDPVHDBCNLRZTANHTWRUERKP251YIJYSLSJOBARGR';

  this.allCafes = ko.observableArray([]);
  this.filter = ko.observable(false);
  this.buttonText = ko.observable();
  this.case = ko.observable(1);

  cafes.forEach(function(objItem) {
    self.allCafes.push(new cafeLocation(objItem));
  });

  this.buttonText("Only show cafes with Wifi");

  // Big time praise for the man who put together this article on knockout utility functions. I couldn't have filtered markers without him!
  //http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
  self.filterToggle = function() {
    if (self.filter() === false) {
      this.buttonText("Show All Cafes");
      self.filter(true);
      this.case(2);
    } else if (self.filter() === true) {
      this.buttonText("Only show cafes with Wifi");
      self.filter(false);
      this.case(1);
    }
  };

  this.filteredCafes = ko.computed(function() {
    switch (this.case()) {
      case 1:
        return ko.utils.arrayFilter(self.allCafes(), function(cafeLocation) {
          cafeLocation.marker.setVisible(true);
          return cafeLocation;
        });
        break;
      case 2:
        return ko.utils.arrayFilter(self.allCafes(), function(cafeLocation) {
          if (cafeLocation.wifi === false) {
            cafeLocation.marker.setVisible(false);
          }
          if (cafeLocation.wifi === true) {
            return cafeLocation;
          }
        });
        break;

      default:
        return self.allCafes();
    }
  }, self);
}

//The ignition function!
function runApp() {
  ko.applyBindings(new AppViewModel());
}
