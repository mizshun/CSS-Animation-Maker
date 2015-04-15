/**
 * @fileoverview 情報パネルエリア管理
 */

// 名前空間
var animMaker = animMaker || {};

/**
 * 情報パネルエリア管理
 * @constructor
 * @classdesc
 */
animMaker.InfoPanel = ( function () {
	'use strict';

	/* コンストラクタ */
	var self = function InfoPanel() {
		this.init();
	}

	/* パブリックメソッド */
	self.prototype = {
		/**
		 * 初期化する
		 */
		init: function () {
			console.info( 'Class: InfoPanel.init()' );
		},

		/**
		 *
		 * @param {object} e イベントオブジェクト
		 */
		showInfoPanel: function ( e ) {
			var $this = $( this );
		}
	}

	return self;
}() );
