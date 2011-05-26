function coords() {
	function p(x,y) {
		var ar = ['coords', y, x, 'display=title', 'type:landmark'];
		prompt('העתק את תוכן השורה והדבק בדף', '{{' + ar.join('|') + '}}');
	}
	if (/maps\.google/i.test(location.href)) 
		return GEvent.addListener(gApplication.getMap(), "singlerightclick", 
			function(point, element, overlay) {
				latlng = this.fromContainerPixelToLatLng(point);
				p(latlng.lng(), latlng.lat());
			});
	if (/amudanan/i.test(location.href)) {
		$("#selectCoordinateSystem").val("WGS84LL");
		$("#divMap").mousedown(
			function(e){
				if (e.which>1)
					p($("#lblLon").html(), $("#lblLat").html())
			});
	}
}
(function ()
{
  if (typeof(jQuery)!="undefined")
  {window.$ = jQuery;coords();return;}
  var s=document.createElement('script');
  s.setAttribute('src',"http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");
  s.onload=coords;
  document.getElementsByTagName('body')[0].appendChild(s);
})();