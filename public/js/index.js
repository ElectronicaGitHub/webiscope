angular.module('pdemo', []).controller('view', [ '$scope', function ($scope) {

	var myMap;
	window.myMap = myMap;

	$scope.langs = [
		{value : "all"   , text :  'All'},
		{value : "ar"    , text :  'العربية'},
		{value : "de"    , text :  'Deutsch'},
		{value : "tr"    , text :  'Türkçe'},
		{value : "en"    , text :  'English'},
		{value : "fi"    , text :  'Finland'},
		{value : "ru"    , text :  'Русский'},
		{value : "it"    , text :  'Italiano'},
		{value : "id"    , text :  'Bahasa Indonesia'},
		{value : "da"    , text :  'Dansk'},
		{value : "es"    , text :  'Español'},
		{value : "fr"    , text :  'Français'},
		{value : "hu"    , text :  'Magyar'},
		{value : "nl"    , text :  'Nederlands'},
		{value : "no"    , text :  'Norsk'},
		{value : "pl"    , text :  'Polski'},
		{value : "pt"    , text :  'Português'},
		{value : "ro"    , text :  'Română'},
		{value : "sv"    , text :  'Svenska'},
		{value : "vi"    , text :  'Tiếng Việt'},
		{value : "uk"    , text :  'Українська мова'},
		{value : "he"    , text :  'עִבְרִית'},
		{value : "ar"    , text :  'العربية'},
		{value : "fa"    , text :  'فارسی'},
		{value : "hi"    , text :  'हिन्दी'},
		{value : "ko"    , text :  '한국어'},
		{value : "ja"    , text :  '日本語'},
		{value : "zh-cn" , text :  '简体中文'},
		{value : "zh-tw" , text :  '繁體中文'}
	];

	setTimeout(function () {
		$('#select-countries').selectize({
		    delimiter: ',',
		    onChange : function (el) {
		    	el = el.replace('string:', '');
		    	$scope.$apply(function () {
		    		$scope.selectedLang = el;
		    	})
		    }
		});
	}, 200);

	$scope.selectedLang = 'ru';

	$scope.$watch('selectedLang', function (val) {
		console.log(val);
		$scope.createMap($scope.more);
	})
								
	var loader = {
		el : $('.vertical-centered-box'),
		state : 'hidden'
	}

	function loaderAction (action) {
		console.log('action', action);
		if (action == 'hide') {
			loader.el.hide();
		} else {
			loader.el.show();
		}
	}

	console._log = console.log;

	console.log = function () {
		// console._log('nothing');
	}

	$scope.periscopes = [];
	$scope.filtered_periscopes = [];
	callbacks = {};

	$scope.wrperiscopeGo = function (obj) {
		console.log(obj.data.broadcast.user_display_name);
		$scope.periscopeGo(obj.id);
	}

	$scope.periscopeGo = function (id) {
		console.log(id.substr(15, 20));
	    window.open('http://periscope.tv/w/' + id, '', 'width=800px,height=700px,resizable=no,scrollbars=no,status=yes');		
	}

	$scope.createMap = function (cb) {
		if (!myMap) {
			var inter = setInterval(function () {
				if (ymaps.Map) {
					clearInterval(inter);
					myMap = new ymaps.Map("map", {
				        center: [55.76, 37.64], 
				        zoom: 7,
				        type : 'yandex#map',
				        controls : []
				    });

				    cb();
				}
			}, 100);
		} else cb();
	}


	$scope.more = function (no_rebound) {

		console.log('more');
        loaderAction('show');

		$.get('https://api.periscope.tv/api/v2/_getRankedFeedPublic?languages=' + $scope.selectedLang, function (data) {

			loader.el.css('opacity', 0.7);
            loaderAction('hide');

            var defs = [];

			for (var i in data) {
				(function (id) {
					defs.push($.getJSON("https://api.periscope.tv/api/v2/getBroadcastPublic?broadcast_id=" + data[i], function (json) {
	
						var local_periscope = {
							data : json,
							id : id
						};
						if (isInList($scope.periscopes, local_periscope, 'username')) return;
						$scope.periscopes.push(local_periscope);

				        myMap.events.add('actionend', function (evt) {
				        	bounds = myMap.getBounds();
				        	$scope.filtered_periscopes = inBounds($scope.periscopes, bounds);
				        	$scope.$apply();
				        });

						$scope.periscopes = $scope.periscopes.filter(function (el) {
							return el.data.broadcast.ip_lat && el.data.broadcast.ip_lng
						});

						$scope.filtered_periscopes = $scope.periscopes;
							
						var json = local_periscope.data;

						if (local_periscope._added) return;

						myGeoObject = new ymaps.Placemark([json.broadcast.ip_lat, json.broadcast.ip_lng], {
		            		geoid : json.broadcast.id
				        }, {
				            iconLayout: 'default#image',
						    iconImageSize: [40, 40],
				            iconImageHref: json.broadcast.image_url
				        });

				        myMap.geoObjects.add(myGeoObject);

				        callbacks[json.broadcast.id] = {
				        	mouseover : function () {
				        		$('ymaps[class*=placemark-overlay] ymaps[class*=image]').removeClass('hovered').addClass('others');
				        		$("*[style*='" + json.broadcast.image_url + "']").addClass('hovered');
				        	},
				        	mouseleave : function () {
				        		$('ymaps[class*=placemark-overlay] ymaps[class*=image]').removeClass('others').removeClass('hovered');
				        	}
				        }

				        myGeoObject.events.add('click', function () {
				        	(function (id, name) {
					        	console.log(name);
					        	$scope.periscopeGo(id);
				        	})(local_periscope.id, json.broadcast.user_display_name);
						});

						myGeoObject.events.add('hover', function () {
							$('.periscope-line').removeClass('hovered');

							$('ymaps[class*=placemark-overlay] ymaps[class*=image]').removeClass('hovered').addClass('others');
			        		$("*[style*='" + json.broadcast.image_url + "']").addClass('hovered');

							b = $('[id-attr=' + json.broadcast.id + ']');
							pos = b.offset();
							if (pos) {
								$('html, body').animate({ scrollTop : pos.top - 100 }, 200);
								b.addClass('hovered');
							}
						});
						myGeoObject.events.add('mouseleave', function () {
			        		$('ymaps[class*=placemark-overlay] ymaps[class*=image]').removeClass('others').removeClass('hovered');
			        		$('.periscope-line').removeClass('hovered');
						});

						local_periscope._added = true;
					}));
				})(data[i]);

				$scope.$apply();
			}

			$.when.apply($, defs).done(function () {
				console.log('when');
				if (!no_rebound) {
					var b = myMap.geoObjects.getBounds();

					b[1][0] = b[1][0] + 3;
		            b[1][1] = b[1][1] + 3;

		            myMap.setBounds(b, {
		                checkZoomRange: false
		            });
				}
			});
		});
	}

	$(document).on('mouseover', '.periscope-line', function () {
		var id = $(this).attr('id-attr');
    	myMap.geoObjects.each(function (el) {
    		inner_id = el.properties.get('geoid');
    		if (inner_id == id) {
    			callbacks[id].mouseover();
    		} 
    	})
    })

    $(document).on('mouseleave', '.periscope-line', function () {
		var id = $(this).attr('id-attr');
    	myMap.geoObjects.each(function (el) {
    		inner_id = el.properties.get('geoid');
    		if (inner_id == id) {
    			callbacks[id].mouseleave();
    		} 
    	})
    })

function inBounds(data, bounds) {
	return data.filter(function (el) {
		if (el.data.broadcast.ip_lat > bounds[0][0] &&
			el.data.broadcast.ip_lng > bounds[0][1] &&
			el.data.broadcast.ip_lat < bounds[1][0] &&
			el.data.broadcast.ip_lng < bounds[1][1]) {
			return el;
		}
	})
}

function isInList(data, object, key) {
	var res = false;
	for (var i in data) {
		if (data[i].data.broadcast[key] == object.data.broadcast[key]) {
			res = true;
			return res;
		}
	}
	return res;
}

function uniqueBy(data, key) {
	var uniqueNames = [];
	var uniqueKeys = [];
	for(i = 0; i< data.length; i++) {
	    if(uniqueKeys.indexOf(data[i].data.broadcast[key]) === -1){
	        uniqueNames.push(data[i]);
	        uniqueKeys.push(data[i].data.broadcast[key]);
	    }        
	}
	return uniqueNames;
}

}]);