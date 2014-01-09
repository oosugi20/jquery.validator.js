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
		this.$input = this.$el.find('[data-validator-input]');
		this.$errormsg = this.$el.find('[data-validator-errormsg]');

		this.type = this.$el.find('[data-validator-type]').attr('data-validator-type');
		this.required = (this.$el.find('[data-validator-required]').attr('data-validator-required') === 'true') ? true : false;
		this.minsize = this.$el.find('[data-validator-minsize]').attr('data-validator-minsize');
		this.event = this.$el.find('[data-validator-event]').attr('data-validator-event');

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

		// 必須項目でなければ、空白になったらokにする
		if (!this.required) {
			this.$el.on(this.event, function () {
				if (!$(this).find(_this.$input).val()) {
					$.each(_this.results, function (key, value) {
						_this.results[key] = true;
						_this.hideErrorMsg(key);
					});
				}
			});
		}
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
		this.$el.trigger('validator:validate');
	};

	/**
	 * ok
	 */
	fn.ok = function () {
		var result = true;
		$.each(this.results, function (key, value) {
			if (!value) {
				result = false;
				return false;
			}
		});
		return result;
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
			case 'select':
				break;
		}
	};

	/**
	 * _setRequiredValidate
	 */
	fn._setRequiredValidate = function () {
		if (this.required === true) {
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
		var result = !!(this.$input.val());

		if (this.type === 'radio' || this.type === 'checkbox') {
			result = !!(this.$input.filter(':checked').val());
		}
		return result;
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



var Validatorgrp = function (element, options) {
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
		var _this = this;
		this.$item = this.$el.find('[data-validator]');
		this.$result = this.$el.find('[data-validatorgrp-result]');
		this.allInputedFlag = false;
		this.$item.on('validator:validate', function () {
			_this.testAllInputed();
			if (_this.allInputedFlag) {
				_this.test();
			}
		});
		this.$el.on('validatorgrp:ok', function () {
			_this.$result.filter('[data-validatorgrp-result="error"]').hide();
			_this.$result.filter('[data-validatorgrp-result="ok"]').show();
		});
		this.$el.on('validatorgrp:error', function () {
			_this.$result.filter('[data-validatorgrp-result="ok"]').hide();
			_this.$result.filter('[data-validatorgrp-result="error"]').show();
		});
	};

	/**
	 * test
	 */
	fn.test = function () {
		var result = true;
		this.$item.filter(function () {
			return $(this).find('[data-validator-input]').val();
		}).each(function () {
			if (!$(this).data('validator').ok()) {
				result = false;
				return false;
			}
		});
		if (result) {
			this.$el.trigger('validatorgrp:ok');
		} else {
			this.$el.trigger('validatorgrp:error');
		}
		return result;
	};

	/**
	 * fn.testAllInputed
	 */
	fn.testAllInputed = function () {
		var result = true;
		this.$item.each(function () {
			var $required = $(this).find('[data-validator-required="true"]');
			if ($required.length && !$required.val()) {
				result = false;
				return false;
			}
		});
		if (result) {
			this.allInputedFlag = true;
			this.$el.trigger('validatorgrp:allinputed');
		}
		return result;
	};
})(Validatorgrp.prototype);

$.fn.validatorgrp = function (options) {
	return this.each(function () {
		var module;
		if (!$.data(this, 'validatorgrp')) {
			module = new Validatorgrp(this, options);
			$.data(this, 'validatorgrp', module);
			module.init();
		}
	});
};

$.Validatorgrp = Validatorgrp;

})(jQuery, this);
