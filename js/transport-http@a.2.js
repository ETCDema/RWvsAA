define(function()
{
	'use strict';

	console.log('init transport.http@a.1...');
	if (!window.fetch) throw new Error('transport.http FAIL: no window.fetch');

	var _hooks					= {};

	function _hookFail(res)
	{
		return !res.ok ? res.text().then(function(err) { return Promise.reject(new Error(err || (res.statusText ? res.status+': '+res.statusText : ('Http error '+res.status)))); }) : null;
	}

	function _hooksExec(res)
	{
		var rh					= res.headers;
		for(var h in _hooks)
		{
			var v				= rh.get('X-HOOK-'+h);
			if (v)
			{
				try
				{
					_hooks[h](JSON.parse(v));
				} catch(e)
				{
					console.error(h+'('+v+') FAIL: '+(e.message || e));
				}
			}
		}
	}

	function _resToJSON(res)
	{
		var fail				= _hookFail(res);
		if (fail) return fail;

		_hooksExec(res);

		return res.json();
	}

	function _autoRes(res)
	{
		var fail				= _hookFail(res);
		if (fail) return fail;

		_hooksExec(res);

		var ct					= res.headers.get('content-type');

		return ct && (/^application\/json($|;.*)/i).test(ct) ? res.json() : res.text();
	}

	function getJSON(url)
	{
		return fetch(url,
		{
			method				: 'GET',		// *GET, POST, PUT, DELETE, etc.
			mode				: 'cors',		// no-cors, *cors, same-origin
			cache				: 'no-cache',	// *default, no-cache, reload, force-cache, only-if-cached
			credentials			: 'same-origin',// include, *same-origin, omit
			redirect			: 'follow',		// manual, *follow, error
			referrerPolicy		: 'no-referrer',// no-referrer, *client
			headers				: {
				Accept			: 'application/json'
			}
		}).then(_resToJSON);
	}

	function postJSON(url, json)
	{
		return fetch(url,
		{
			method				: 'POST',		// *GET, POST, PUT, DELETE, etc.
			mode				: 'cors',		// no-cors, *cors, same-origin
			cache				: 'no-cache',	// *default, no-cache, reload, force-cache, only-if-cached
			credentials			: 'same-origin',// include, *same-origin, omit
			redirect			: 'follow',		// manual, *follow, error
			referrerPolicy		: 'no-referrer',// no-referrer, *client
			headers				: {
				'Content-Type'	: 'application/json',
				Accept			: 'application/json'
			},
			body				: json			
		}).then(_resToJSON);
	}

	function getData(url)
	{
		return fetch(url,
		{
			method				: 'GET',		// *GET, POST, PUT, DELETE, etc.
			mode				: 'cors',		// no-cors, *cors, same-origin
			cache				: 'default',	// *default, no-cache, reload, force-cache, only-if-cached
			credentials			: 'same-origin',// include, *same-origin, omit
			redirect			: 'follow',		// manual, *follow, error
			referrerPolicy		: 'no-referrer',// no-referrer, *client
			headers				: {
				Accept			: 'text/*,application/json,*/*'
			}
		}).then(_autoRes);
	}

	function postData(url, data)
	{
		return fetch(url,
		{
			method				: 'POST',		// *GET, POST, PUT, DELETE, etc.
			mode				: 'cors',		// no-cors, *cors, same-origin
			cache				: 'no-cache',	// *default, no-cache, reload, force-cache, only-if-cached
			credentials			: 'same-origin',// include, *same-origin, omit
			redirect			: 'follow',		// manual, *follow, error
			referrerPolicy		: 'no-referrer',// no-referrer, *client
			headers				: {
				'Content-Type'	: 'application/x-www-form-urlencoded',
				Accept			: 'text/*,application/json'
			},
			body				: data			
		}).then(_autoRes);
	}

	function setHook(header, fx)
	{
		_hooks[header]			= fx;
	}

	return {
		type		: 'HTTP',
		getJSON		: getJSON,
		postJSON	: postJSON,
		getData		: getData,
		postData	: postData,
		setHook		: setHook
	}
});
