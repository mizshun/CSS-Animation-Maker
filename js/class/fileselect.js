/**
 * @fileoverview パーツ選択エリア
 */

// 名前空間
var animMaker = animMaker || {};

/**
 * パーツ選択エリア
 * @constructor
 * @classdesc
 */
animMaker.FileSelect = ( function () {
	'use strict';

	/* ------------------------------
	 定数
	 ------------------------------*/
	var CLASS_ACTIVE = 'active';

	/* ------------------------------
	 HTMLテンプレート
	 ------------------------------*/
	var TEMPLATE_FILES = [
		'<ul>',
		'<% _.each( collection, function( character ) { %>',
			'<li id="<%- character.data.id %>"><img src="<%- character.data.dataURI %>" alt="<%- character.data.file.name %>" title="<%- character.data.file.name %>"></li>',
		'<% } ) %>',
		'</ul>'
	].join( '' );

	/* コンストラクタ */
	var self = function FileSelect() {
		/* ------------------------------
		 メンバ
		 ------------------------------*/
		/**
		 * @type {string} 現在選択されているボタン
		 */
		this.data = {
			currentActive: ''
		};

		/* ------------------------------
		 DOMアクセス
		 ------------------------------*/
		this.dom = {};
		/**
		 * @type {jQueryObject} パーツ選択エリア
		 */
		this.dom.$areaControlSelect = $( '#area-control__select' );

		this.init();
	}

	self.prototype = {
		/**
		 * 初期化する
		 */
		init: function () {
			console.info( 'Class: FileSelect.init()' );

			/* ------------------------------
			 イベント
			 ------------------------------*/
			this.dom.$areaControlSelect
				// キャラクターパーツが読み込まれたとき
				.on( animMaker.ns + 'setCharacterCollection',       this.ctlSetCharacterCollection /* args: e, datas */ )
				// ボタンをクリックしたとき
				.on( 'click',                                 'li', this.ctlSelectedParts )
				// 描画を更新するとき
				.on( 'view',                                        $.proxy( this.render, this ) )
				// 選択されているボタンをプロパティにセットしたとき
				.on( 'currentActive',                         'li', $.proxy( this.renderCurrentActive, this ) )
				// 操作エリアが押されたとき
				.on( animMaker.ns + 'AreaMouseDown',                this.ctlAreaMouseDown )
				// キャラクターパーツが削除されるとき
				.on( animMaker.ns + 'DeleteParts',            'li', this.ctlDeleteParts );
		},

		/* ------------------------------
		 コントローラー
		 ------------------------------*/
		/**
		 * キャラクターパーツが読み込まれたとき
		 * @param  {object} e     イベントオブジェクト
		 * @param  {object} datas キャラクターパーツのデータコレクション
		 */
		ctlSetCharacterCollection: function ( e, datas ) {
			// コレクションデータから必要なものを取得して再構成する
			var mn         = animMaker.main,
			    collection = { collection: datas };

			collection     = self.prototype.convertCharacterCollectionData( collection, 'id', mn.data.PARTS_ID, mn.data.SELECT_ID );

			// ビューへ通知
			$( this ).trigger( 'view', [collection] );
		},

		/**
		 * ボタンをクリックしたとき
		 * @param  {object} e イベントオブジェクト
		 */
		ctlSelectedParts: function ( e ) {
			e.stopPropagation();

			// プロパティセット
			self.prototype.setCurrentActive( $( e.currentTarget ) );
		},

		/**
		 * 操作エリアが押されたとき
		 * @param  {object} e イベントオブジェクト
		 */
		ctlAreaMouseDown: function ( e ) {
			// 選択されていた要素のIDを削除する
			self.prototype.deleteCurrentActive();
			// ハイライト教示を削除する
			self.prototype.renderDeleteActive();
		},

		/**
		 * キャラクターパーツが削除されるとき
		 * @param  {object} e イベントオブジェクト
		 */
		ctlDeleteParts: function ( e ) {
			e.stopPropagation();

			var id = $( e.target ).attr( 'id' );

			// 選択されていた要素のIDをプロパティから削除する
			self.prototype.deleteCurrentActive();
			self.prototype.remove( $( e.target ) );
		},

		/* ------------------------------
		 ビュー
		 ------------------------------*/
		 /**
		  * 選択エリアの表示を描画する
		  * @param  {object} e          イベントオブジェクト
		  * @param  {object} collection
		  */
		render: function ( e, collection ) {
			var $areaControlSelect = $( e.target );
			var currentActive      = this.data.currentActive;
			var compiled           = _.template( TEMPLATE_FILES );

			// 追加
			$areaControlSelect
				.empty()
				.append( compiled( collection ) );

			// 現在選択されている要素があればハイライト表示する
			if ( currentActive ) {
				$( '#' + currentActive ).trigger( 'currentActive' );
			}
		},

		/**
		 * 選択されている要素をハイライトする
		 * @param {jQueryObject} $active 選択された要素
		 */
		renderCurrentActive: function ( e ) {
				// 全削除
				self.prototype.renderDeleteActive();

				// クラス付与
				if ( this.data.currentActive ) {
					$( e.target ).addClass( CLASS_ACTIVE );
				}
		},

		/**
		 * 要素のハイライトを削除する
		 */
		renderDeleteActive: function () {
			var $areaControlSelect = animMaker.main.fileSelect.dom.$areaControlSelect;
			$areaControlSelect.find( 'li' ).removeClass( CLASS_ACTIVE );
		},

		/* ------------------------------
		 モデル
		 ------------------------------*/
		/**
		 * SETTER
		 * @param {string} propName プロパティ名
		 * @param {mix} val セットする値
		 * return {boolean}
		 */
		set: function ( propName, val ) {
			var data = animMaker.main.fileSelect.data;

			if ( undefined !== typeof data[ propName ] ) {
				data[ propName ] = val;
				return true;
			}
			return false;
		},

		/**
		 * GETTER
		 * @param {string} propName プロパティ名
		 * return {mix} プロパティの値
		 */
		get: function ( propName ) {
			var data = animMaker.main.fileSelect.data;

			if ( undefined !== typeof data[ propName ] ) {
				return data[ propName ];
			}
			return '';
		},

		/**
		 * パーツを削除する
		 * @param  {jQueryObject} $removeBtn 削除するボタン
		 */
		remove: function ( $removeBtn ) {
			$removeBtn.remove();
		},

		/**
		 * 選択されているかチェックする
		 * return {string} 選択されているボタン名
		 */
		getCurrentActive: function () {
			return animMaker.main.fileSelect.data.currentActive;
		},

		/**
		 * 選択されているボタンをプロパティにセットする
		 * @param {jQueryObject} $current 選択された要素
		 */
		setCurrentActive: function ( $current ) {
			var currentId         = $current.attr( 'id' ),
			    partsId           = '',
			    character         = {},
			    $areaControlPanel = {};

			// 選択されているボタンのIDをセットする
			self.prototype.set( 'currentActive', currentId );

			// 選択されているボタンに通知する
			$current.trigger( 'currentActive' );

			// パーツに通知する
			partsId = self.prototype.convertId( currentId, animMaker.main.data.SELECT_ID, animMaker.main.data.PARTS_ID );

			$( '#' + partsId ).trigger( 'changeCurrentActive' );

			// 操作パネルに通知する
			$areaControlPanel = animMaker.main.controlPanel.dom.$areaControlPanel,
			character         = animMaker.main.characterCollection.getCurrentCollectionData( partsId );
			$areaControlPanel.trigger( animMaker.ns + 'changeCurrentParts', [character] );
		},

		/**
		 * 選択されていた要素のIDを削除する
		 */
		deleteCurrentActive: function () {
			var fileSelect = animMaker.main.fileSelect;
			// 無選択にする
			fileSelect.data.currentActive = '';
		},

		/**
		 * id名を変換する
		 * @param  {[type]} originId [description]
		 * @return {[type]}          [description]
		 * example 例) upload-file-sub-1 → parts-enemy-sub-1
		 */
		convertId: function ( originId, before, after ) {
			if ( 'string' !== typeof originId ) { return originId; }

			return originId.replace( before, after );
		},

		/**
		 * データコレクションから値を変更する
		 * @param  {object} collectionData データコレクション
		 * @param  {string} key プロパティ名
		 * @param  {string} before 変更する文字列
		 * @param  {string} after 変更後の文字列
		 * @return {array} retval 変更した新しいデータコレクション
		 */
		convertCharacterCollectionData: function ( collectionData, key, before, after ) {
			var retval = {};
			retval.collection  = $.map( collectionData.collection, function ( v, i ) {
				var temp           = {};
				    temp.data      = {};
				    temp.data.file = {};

				$.each( v.data, function ( propInd, propVal ) {
					// 値変更
					if ( propInd === key ) {
						temp.data[propInd] = self.prototype.convertId( propVal, before, after );
					} else {
						temp.data[propInd] = propVal;
					}
				} );
				return temp;
			} );
			return retval;
		}
	}

	return self;
}() );
