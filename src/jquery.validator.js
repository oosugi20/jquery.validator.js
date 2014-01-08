;(function ($, window, undefiend) {
'use script';

var MODULE_NAME = 'Validator';
var PLUGIN_NAME = 'validator';
var Module;


/**
 * Module
 */
Module = function (element, options) {
	this.el = element;
	this.$el = $(element);
	this.options = $.extend({
	}, options);
};

(function (fn) {
	/**
	 * init
	 */
	fn.init = function () {
		this._prepareElms();

		this.type = this.$input.attr('data-validator-type');
		this.required = !!(this.$input.attr('data-validator-required'));
		this.minsize = this.$input.attr('data-validator-minsize');
		this.event = this.$input.attr('data-validator-event');

		this.validates = {
			type: function () { return true; },
			required: function () { return true; },
			minsize: function () { return true; }
		};

		this.results = {
			type: false,
			required: false,
			minsize: true
		};

		this._setTypeValidate();
		this._setRequiredValidate();
		this._setMinSizeValidate();

		this._eventify();

		this.$el.trigger('validator:ready');
	};

	/**
	 * _prepareElms
	 */
	fn._prepareElms = function () {
		this.$input = this.$el.find('[data-validator-type]');
		this.$errormsg = this.$el.find('[data-validator-errormsg]');
	};

	/**
	 * _eventify
	 */
	fn._eventify = function () {
		var _this = this;

		this.$el.on(this.event, function () {
			_this.validate();
		});

		this.$el.on('validator:error', function (event, key) {
			_this.showErrorMsg(key);
		});

		this.$el.on('validator:ok', function (event, key) {
			_this.hideErrorMsg(key);
		});
	};

	/**
	 * showErrorMsg
	 */
	fn.showErrorMsg = function (key) {
		this.$errormsg.filter('[data-validator-errormsg="' + key + '"]').show();
	};

	/**
	 * hideErrorMsg
	 */
	fn.hideErrorMsg = function (key) {
		this.$errormsg.filter('[data-validator-errormsg="' + key + '"]').hide();
	};

	/**
	 * validate
	 */
	fn.validate = function () {
		var _this = this;
		$.each(this.validates, function (key, validate) {
			_this.results[key] = validate();
			if (_this.results[key] === false) {
				_this.$el.trigger('validator:error', key);
			} else {
				_this.$el.trigger('validator:ok', key);
			}
		});
	};


	/**
	 * _setTypeValidate
	 */
	fn._setTypeValidate = function () {
		switch (this.type) {
			case 'alphabet':
				this.validates.type = $.proxy(this.isAlphabet, this);
				break;
			case 'number':
				this.validates.type = $.proxy(this.isNumber, this);
				break;
			case 'alphabet-or-number':
				this.validates.type = $.proxy(this.isAlphabetOrNumber, this);
				break;
			case 'alphabet-and-number':
				this.validates.type = $.proxy(this.isAlphabetAndNumber, this);
				break;
			case 'fullwidthchar':
				this.validates.type = $.proxy(this.isFullWidthChar, this);
				break;
		}
	};

	/**
	 * _setRequiredValidate
	 */
	fn._setRequiredValidate = function () {
		if (this.required) {
			this.validates.required = $.proxy(this.isRequired, this);
		}
	};

	/**
	 * _setMinSizeValidate
	 */
	fn._setMinSizeValidate = function () {
		if (this.minsize) {
			this.validates.minsize = $.proxy(this.testMinSize, this);
		}
	};


	/**
	 * isRequired
	 */
	fn.isRequired = function () {
		return !!(this.$input.val());
	};

	/**
	 * isAlphabet
	 */
	fn.isAlphabet = function () {
		return /^[a-zA-Z]+$/.test(this.$input.val());
	};

	/**
	 * hasAlphabet
	 */
	fn.hasAlphabet = function () {
		return /^.*[a-zA-Z].*$/.test(this.$input.val());
	};

	/**
	 * hasNumber
	 */
	fn.hasNumber = function () {
		return /^.*[0-9].*$/.test(this.$input.val());
	};

	/**
	 * isNumber
	 */
	fn.isNumber = function () {
		return /^[0-9]+$/.test(this.$input.val());
	};

	/**
	 * isAlphabetOrNumber
	 */
	fn.isAlphabetOrNumber = function () {
		return /^[a-zA-Z0-9]+$/.test(this.$input.val());
	};

	/**
	 * isAlphabetAndNumber
	 */
	fn.isAlphabetAndNumber = function () {
		return (this.isAlphabetOrNumber() && this.hasAlphabet() && this.hasNumber());
	};

	/**
	 * isFullWidthChar
	 */
	fn.isFullWidthChar = function () {
		return /^[^ -~｡-ﾟ\t　]+$/.test(this.$input.val());
	};

	/**
	 * testMinSize
	 */
	fn.testMinSize = function () {
		return this.minsize <= this.$input.val().length;
	};

})(Module.prototype);


// set jquery.fn
$.fn[PLUGIN_NAME] = function (options) {
	return this.each(function () {
		var module;
		if (!$.data(this, PLUGIN_NAME)) {
			module = new Module(this, options);
			$.data(this, PLUGIN_NAME, module);
			module.init();
		}
	});
};

// set global
$[MODULE_NAME] = Module;

})(jQuery, this);
