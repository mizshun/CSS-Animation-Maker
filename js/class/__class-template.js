/**
 * @fileoverview
 */

// 名前空間
var animMaker = animMaker || {};

/**
 *
 * @constructor
 * @classdesc
 */
animMaker.ClassName = ( function () {
	'use strict';

	/* ------------------------------
	 定数
	 ------------------------------*/
	var CONST = 'xxxx';

	/* コンストラクタ */
	var self = function ClassName() {
		/* ------------------------------
		 メンバ
		 ------------------------------*/
		this.xxxx = 'xxxx';

		/* ------------------------------
		 DOMアクセス
		 ------------------------------*/


		this.init();
	};

	/* パブリックメソッド */
	self.prototype = {
		/**
		 * 初期化する
		 */
		init: function () {
			console.info( 'Class: ClassName.init()' );

			/* ------------------------------
			 イベント
			 ------------------------------*/
		},

		/* ------------------------------
		 コントローラー
		 ------------------------------*/
		ctl: function () {
			// execute
		},

		/* ------------------------------
		 ビュー
		 ------------------------------*/
		render: function () {
			// execute
		},

		/* ------------------------------
		 モデル
		 ------------------------------*/
		func: function () {
			// execute
		},
	};

	return self;
}() );
