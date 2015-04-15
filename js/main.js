/**
 * @fileoverview メイン実行ファイル
 */

// 名前空間
var animMaker = animMaker || {};

/* ------------------------------
 メンバ
 ------------------------------*/
animMaker.ns     = 'animMaker';

/**
 * メイン実行
 * @constructor
 * @classdesc
 */
animMaker.Main = ( function ( w, d, $ ) {
	'use strict';

	/* ------------------------------
	 定数
	 ------------------------------*/
	// インクルードするクラス
	var CLASSES = [
		// データ管理クラス作成
		'ManageData',
		// アニメーション管理クラス作成
		'ManageAnim',
		// キャラクターパーツコレクション作成
		'CharacterCollection',
		// アップローダー作成
		'FileUpLoader',
		// パーツ選択エリア作成
		'FileSelect',
		// コントロールキャラクターエリア作成
		'ControlEnemy',
		// コントロールパネルエリア作成
		'ControlPanel'
		// 情報パネルエリア作成
		// TODO: 未使用
		// 'InfoPanel'
	];

	/* コンストラクタ */
	var self = function Main() {
		/* ------------------------------
		 メンバ
		 ------------------------------*/
		this.data = {
			// アップロードボタンのID名
			UPLOAD_ID      : 'upload-file',
			// 選択ボタンのID名
			SELECT_ID      : 'select-file',
			// キャラクターパーツのID名
			PARTS_ID       : 'parts-enemy',
			// キャラクターパーツの最大アップロード数
			MAX_UPLOAD_NUM : 8,
			// キャラクターパーツの最大アップロードサイズ
			MAX_UPLOAD_SIZE: 102400
		};

		/* ------------------------------
		 DOMアクセス
		 ------------------------------*/
		this.dom = {};
		/**
		 * HEAD要素
		 * @private {object}
		 */
		this.dom.$head = $( 'head' );
		/**
		 * BODY要素
		 * @type {jQueryObject}
		 */
		this.dom.$body = $( 'body' );
	};

	/* パブリックメソッド */
	self.prototype = {
		/**
		 * 初期化する
		 */
		init: function () {
			console.info( 'Class: Main.init()' );

			// jQuery独自プロパティにdataTransferを追加する
			this.setJQueryEventProp( 'dataTransfer' );

			// クラスをインクルードしてインスタンス化する
			this.loadClasses( CLASSES, /* use proxy */ this );

			// 操作エリアに通知する
			this.controlEnemy.dom.$areaEnemy.trigger( animMaker.ns + 'classLoaded' );
		},

		/* ------------------------------
		 モデル
		 ------------------------------*/
		/**
		 * クラスをインクルードしてインスタンス化する
		 * @param  {array} classes クラス名
		 * @param  {object} self this参照
		 */
		loadClasses: function ( classes, self ) {
			$.each( classes, function ( i, v ) {
				if ( animMaker[v] && '[object Function]' === Object.prototype.toString.call( animMaker[v] ) ) {
					self[self.convertCamelCase( v )] = new animMaker[v]();
				} else {
					alert( 'エラー main.loadClasses: ' +  v );
				}
			} );
		},

		/**
		 * キャメルケースに変換する
		 * @param  {string} str 変換する文字列
		 * @return {string} 変換した文字列
		 */
		convertCamelCase: function ( str ) {
			 return str.charAt( 0 ).toLowerCase() + str.substring( 1 );
		},

		/**
		 * jQuery独自プロパティにプロパティを追加する
		 * @param {string} propName イベントプロパティに追加するプロパティ名
		 */
		setJQueryEventProp: function ( propName ) {
			if ( 'string' !== typeof propName ) { return; }

			if ( -1 === jQuery.event.props.indexOf( propName ) ) {
				jQuery.event.props.push( propName );
			}
		},

		/**
		 * オブジェクトに含まれるスタイルを適用する
		 * @param {object} obj 適用するスタイルを持つのオブジェクト
		 *     例) { margin: 10, position: 'absolute' }
		 * @param {object} $el 適用する要素オブジェクト
		 */
		setCssStyles: function ( obj, $el ) {
			$.each( obj, function ( key, val ) {
				var temp = {};

				temp[key] = val;
				$el.css( temp );
			});
		}
	}

	return self;
}( window, document, jQuery ) );
