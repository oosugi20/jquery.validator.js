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
		var _this = this;

		this.$input = this.$el.find('[data-validator-input]');
		this.$unit = this.$el.find('[data-validator-type]');
		this.$errormsg = this.$el.find('[data-validator-errormsg]');

		this.type = this.$unit.attr('data-validator-type');

		var required = this.$el.find('[data-validator-required]').attr('data-validator-required');
		this.required = (required !== undefined && required !== 'false') ? true : false;

		this.event = this.$el.find('[data-validator-event]').attr('data-validator-event');

		var initapply = this.$el.attr('data-validator-initapply');
		this.initapply = (initapply !== undefined && initapply !== 'false') ? true : false;

		this.validates = {
			type: function () { return true; },
			required: function () { return true; },
			minsize: function () { return true; }
		};

		this.results = {
			type: true,
			required: _this.requiredOk(),
			minsize: true
		};

		this._setTypeValidate();
		this._setRequiredValidate();
		this._setMinSizeValidate();

		this._eventify();

		this.$unit.each(function () {
			$(this).data('validator-inputed', false)
		});

		if (this.initapply) {
			this.validate();
			this.$unit.each(function () {
				$(this).data('validator-inputed', true)
			});
		}

		this.$el.trigger('validator:ready');
	};

	/**
	 * _eventify
	 */
	fn._eventify = function () {
		var _this = this;

		this.$el.on(this.event, '[data-validator-input]', function (event) {
			var isTab = (event.keyCode === 9);
			if (!isTab) {
				_this.validate();
			}

		});

		this.$el.on('validator:error', function (event, key) {
			if (key === 'required') {

				var isInputedAll = (function () {
					return !(_this.$unit.filter('[data-validator-required]').filter(function () {
						return $(this).data('validator-inputed') === false;
					}).length);
				})();

				if (isInputedAll || _this.$unit.filter('[data-validator-required]').filter(function () {
					return $(this).data('validator-inputed') === true;
				}).filter(function () {
					return !$(this).val();
				}).length) {
					_this.hideErrorMsg('all');
					_this.showErrorMsg(key);
				}
			} else {
				_this.showErrorMsg(key);
			}
		});

		this.$el.on('validator:ok', function (event, key) {
			_this.hideErrorMsg(key);
		});


		// 一回でも入力されたかどうかのチェック
		this.$el.on('keyup', '[data-validator-type]', function (event) {
			var isTab = (event.keyCode === 9);
			if (!isTab && $(this).val()) {
				$(this).data('validator-inputed', true);
			}
		});
		this.$el.on('change', '[data-validator-type]', function () {
			$(this).data('validator-inputed', true)
		});
		this.$el.on('blur', '[data-validator-type]', function (event) {
			$(this).data('validator-inputed', true);
		});

		// 必須項目でなければ、空白になったらokにする
		this.$el.on(this.event, '[data-validator-type]:not([data-validator-required])', function () {
			if (!_this.isRequired($(this)) && !$(this).val()) {
				$.each(_this.results, function (key, value) {
					_this.results[key] = true;
					_this.hideErrorMsg(key);
				});
			}
		});
	};

	/**
	 * showErrorMsg
	 */
	fn.showErrorMsg = function (key) {
		if (key === 'all') {
			this.$errormsg.show();
		} else {
			this.$errormsg.filter('[data-validator-errormsg="' + key + '"]').show();
		}
	};

	/**
	 * hideErrorMsg
	 */
	fn.hideErrorMsg = function (key) {
		if (key === 'all') {
			this.$errormsg.hide();
		} else {
			this.$errormsg.filter('[data-validator-errormsg="' + key + '"]').hide();
		}
	};

	/**
	 * validate
	 */
	fn.validate = function () {
		var _this = this;
		var _validate = function (key, validate) {
			_this.results[key] = validate();

			if (_this.results[key] === false) {
				// blurでdata-validator-inputedの状態を変えるのでその後に実行
				setTimeout(function () {
					_this.$el.trigger('validator:error', key);
				}, 4);
			} else {
				setTimeout(function () {
					_this.$el.trigger('validator:ok', key);
				}, 4);
			}
		};

		// 必須チェックは必ず最後に実行する
		$.each(this.validates, function (key, validate) {
			if (key !== 'required') {
				_validate(key, validate);
			}
		});
		_validate('required', this.validates.required);
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
			case 'email':
				this.validates.type = $.proxy(this.isEmail, this);
				break;
			case 'reinput':
				this.validates.type = $.proxy(this.reinputOk, this);
				break;
		}
	};

	/**
	 * _setRequiredValidate
	 */
	fn._setRequiredValidate = function () {
		this.validates.required = $.proxy(this.requiredOk, this);
	};

	/**
	 * _setMinSizeValidate
	 */
	fn._setMinSizeValidate = function () {
		if (this.$el.find('[data-validator-minsize]').length) {
			this.validates.minsize = $.proxy(this.testMinSize, this);
		}
	};


	/**
	 * isRequired
	 */
	fn.isRequired = function ($input) {
		var attr = $input.attr('data-validator-required');
		return (attr !== undefined && attr !== 'false') ? true : false;
	};


	/**
	 * isSame
	 */
	fn.isSame = function ($input, $target) {
		return $input.val() === $target.val();
	};


	/**
	 * requiredOk
	 * 必須項目が入力済みか調べて返す。
	 * 必須項目でなければtrueを返す。
	 */
	fn.requiredOk = function () {
		var _this = this;
		var result = true;

		this.$unit.filter(function () {
			return _this.isRequired($(this)); // 必須のもののみ
		}).each(function () {
			var $this = $(this);
			var $input = (_this.type === 'radio' || _this.type === 'checkbox') ? $this.find(_this.$input.filter(':checked')) : $this;

			if (!$input.val()) {
				result = false;
				return false;
			}
		});

		return result;
	};


	/**
	 * reinputOk
	 */
	fn.reinputOk = function () {
		var _this = this;
		var result = true;

		this.$unit.each(function () {
			var $this = $(this);
			var $input = (_this.type === 'radio' || _this.type === 'checkbox') ? $this.find(_this.$input.filter(':checked')) : $this;
			var $target = $('[data-validator-id="' + $this.attr('data-validator-reinputtarget') + '"]');

			if (!_this.isSame($input, $target)) {
				result = false;
				return false;
			}
		});

		return result;
	};

	/**
	 * isAlphabet
	 */
	fn.isAlphabet = function () {
		var _this = this;
		var result = true;

		this.$unit.each(function () {
			if ($(this).val()) {
				if (!/^[a-zA-Z]+$/.test($(this).val())) {
					result = false;
					return false;
				}
			}
		});

		return result;
	};

	/**
	 * hasAlphabet
	 */
	fn.hasAlphabet = function () {
		var _this = this;
		var result = true;

		this.$unit.each(function () {
			if ($(this).val()) {
				if (!/^.*[a-zA-Z].*$/.test($(this).val())) {
					result = false;
					return false;
				}
			}
		});

		return result;
	};

	/**
	 * hasNumber
	 */
	fn.hasNumber = function () {
		var _this = this;
		var result = true;

		this.$unit.each(function () {
			if ($(this).val()) {
				if (!/^.*[0-9].*$/.test($(this).val())) {
					result = false;
					return false;
				}
			}
		});

		return result;
	};

	/**
	 * isNumber
	 */
	fn.isNumber = function () {
		var _this = this;
		var result = true;

		this.$unit.each(function () {
			if ($(this).val()) {
				if (!/^[0-9]+$/.test($(this).val())) {
					result = false;
					return false;
				}
			}
		});

		return result;
	};

	/**
	 * isAlphabetOrNumber
	 */
	fn.isAlphabetOrNumber = function () {
		var _this = this;
		var result = true;

		this.$unit.each(function () {
			if ($(this).val()) {
				if (!/^[a-zA-Z0-9]+$/.test($(this).val())) {
					result = false;
					return false;
				}
			}
		});

		return result;
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
		var _this = this;
		var result = true;

		this.$unit.each(function () {
			if ($(this).val()) {
				if (!/^[^ -~｡-ﾟ\t　]+$/.test($(this).val())) {
					result = false;
					return false;
				}
			}
		});

		return result;
	};

	/**
	 * isEmail
	 * @ が付いた文字列になっているかどうか
	 */
	fn.isEmail = function () {
		var _this = this;
		var result = true;

		this.$unit.each(function () {
			if ($(this).val()) {
				if (!/.+@.+$/.test($(this).val())) {
					result = false;
					return false;
				}
			}
		});

		return result;
	};

	/**
	 * testMinSize
	 */
	fn.testMinSize = function () {
		var _this = this;
		var result = true;

		this.$unit.each(function () {
			if ($(this).val()) {
				if (!($(this).attr('data-validator-minsize') <= $(this).val().length)) {
					result = false;
					return false;
				}
			}
		});

		return result;
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
		this.$item.on('validator:validate', function () {
			_this.test();
			//_this.testAllInputed();
		});
		//this.$el.on('validatorgrp:allinputed', function () {
		//	_this.test();
		//});
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
		this.$item.each(function () {
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

	///**
	// * fn.testAllInputed
	// */
	//fn.testAllInputed = function () {
	//	var result = true;
	//	var _this = this;
	//	this.$item.each(function () {
	//		var $this = $(this);
	//		var $required = $this.find('[data-validator-required]').not('[data-validator-required="false"]');
	//		var type = $this.data('validator').type;
	//		var val = (type === 'radio' || type === 'checkbox') ? $required.find(':checked').val() : $required.val();
	//		if ($required.length && !val) {
	//			result = false;
	//			return false;
	//		}
	//	});
	//	if (result) {
	//		// validatorのevent後に発火させる
	//		setTimeout(function () {
	//			_this.$el.trigger('validatorgrp:allinputed');
	//		}, 4);
	//	}
	//	return result;
	//};
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


var Validatorform = function (element, options) {
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

		this.$submit = this.$el.find('[data-validatorform-submit]');
		this.$submit.addClass('disabled');
		this.$item = this.$el.find('[data-validator]');

		this.$el.on('validator:validate', function () {
			_this.test();
		});

		this.$el.on('validatorform:ok', function () {
			_this.$submit.removeClass('disabled');
			_this.$submit.addClass('enabled');
		});

		this.$el.on('validatorform:error', function () {
			_this.$submit.addClass('disabled');
			_this.$submit.removeClass('enabled');
		});
	};

	/**
	 * test
	 */
	fn.test = function () {
		var result = true;
		this.$item.each(function () {
			if (!$(this).data('validator').ok()) {
				result = false;
				return false;
			}
		});
		if (result) {
			this.$el.trigger('validatorform:ok');
		} else {
			this.$el.trigger('validatorform:error');
		}
		return result;
	};

})(Validatorform.prototype);

$.fn.validatorform = function (options) {
	return this.each(function () {
		var module;
		if (!$.data(this, 'validatorform')) {
			module = new Validatorform(this, options);
			$.data(this, 'validatorform', module);
			module.init();
		}
	});
};

$.Validatorform = Validatorform;

})(jQuery, this);
