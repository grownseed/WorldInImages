window.addEvent('domready', function()
{
	var cells = [];

	var getCell = function(geo)
	{
		var x = Math.floor((geo[0] + 180) * 100 / 360),
			y = Math.floor((90 - geo[1]) * 100 / 180);

		if (cells[x] == undefined)
			cells[x] = [];

		if (cells[x][y] == undefined)
		{
			cells[x][y] = new Element('div',
			{
				'class': 'cell',
				'styles': {'left': x + '%', 'top': y + '%'}
			}).inject($('container'));
		}

		return cells[x][y];
	};

	var position = function(data)
	{
		var coordinates = (data.coordinates ? data.coordinates.coordinates : data.place.bounding_box.coordinates[0][0]),
			cell = getCell(coordinates),
			image_src = data.entities.media[0].media_url;

		if (!cell.hasClass('highlight'))
		{
			new Asset.image(image_src,
			{
				'onLoad': function()
				{
					cell.fade('out');

					(function()
					{
						cell.setStyle('background-image', 'url(' + image_src + ')').fade('in');
						(function(){ cell.addClass('highlight') }).delay(200);
						(function(){ cell.removeClass('highlight') }).delay(1000);
					}).delay(500);

				}
			});
		}
	};

	//listen to socket
	var socket = io.connect('/');

	socket.on('twitter', function(data)
	{
		position(data);
	});
});