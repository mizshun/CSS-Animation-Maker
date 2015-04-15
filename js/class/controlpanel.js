/**
 * @fileoverview コントロールパネルエリア
 */

// 名前空間
var animMaker = animMaker || {};

/**
 * コントロールパネルエリア
 * @constructor
 * @classdesc
 */
animMaker.ControlPanel = ( function () {
	'use strict';

	/* ------------------------------
	 定数
	 ------------------------------*/
	var // パーツ名初期値
	    BLANK_PARTS_NAME         = 'パーツ選択なし',
	    // パーツ重なり順初期値
	    BLANK_PARTS_ZINDEX       = '--',
	    // 活性時クラスネーム
	    CLASS_ACTIVE             = 'active',
	    // パーツ削除確認のテキスト
	    CONFIRRM_DELETE_PARTS_TEXT = '本当に削除しますか？';
	/* ------------------------------
	 HTMLテンプレート
	 ------------------------------*/
	// パーツ順序
	var TEMPLATE_ZINDEX = [
		'<div><%- css.zIndex %></span></div>'
	].join( '' );

	/* コンストラクタ */
	var self = function ControlPanel() {
		/* ------------------------------
		 DOMアクセス
		 ------------------------------*/
		this.dom = {
			/**
			 * BODY要素
			 * @type {jQueryObject}
			 */
			$body                : animMaker.main.dom.$body,
			/**
			 * 操作パネル ルート
			 * @type {jQueryObject}
			 */
			$areaControlPanel    : $( '#area-control__panel' ),
			/**
			 * パーツ名
			 * @type {jQueryObject}
			 */
			$panelPartsName      : $( '#area-control__panel-parts-name' ),
			/**
			 * パーツ順序
			 * @type {jQueryObject}
			 */
			$panelPartsZIndex    : $( '#area-control__panel-parts-zindex' ),
			/**
			 * アニメーション操作エリア
			 * @type {jQueryObject}
			 */
			$panelAnims          : $( '#area-control__panel-anims' ),
			/**
			 * アニメーション追加ボタン
			 * @type {jQueryObject}
			 */
			$addAnim             : $( '#area-control__add-anim' ),
			/**
			 * パーツ削除ボタン
			 * @type {jQueryObject}
			 */
			$animMakerDeleteParts: $( '#area-control__delete-parts' )
		};

		this.init();
	}

	self.prototype = {
		init: function ( e ) {
			console.info( 'Class: ControlPanel.init()' );

			/* ------------------------------
			 イベント
			 ------------------------------*/
			this.dom.$areaControlPanel
				// 現在選択されているパーツが変わったとき
				.on( animMaker.ns + 'changeCurrentParts' + ' ' +
				     animMaker.ns + 'AreaMouseDown', this.ctlCurrentParts /* args: e, characterData, dom */ )

				// パネルを表示するとき
				.on( animMaker.ns + 'UpdatePanel',       this.ctlUpdatePanel     /* arg: e, characterData */ );

			this.dom.$addAnim
				// アニメーション追加ボタンをクリックしたとき
				.on( 'click',                            this.ctlAddNewAnimation );

			this.dom.$animMakerDeleteParts
				// パーツ削除ボタンをクリックしたとき
				.on( 'click',                            this.ctlDeleteParts );

			// ドラッグ可能にする
			this.setDraggable();

			// アニメーション管理に通知
			// this.dom.$body.trigger( animMaker.ns + 'controlPanelInit' );

			// 初期表示
			this.dom.$areaControlPanel.trigger( animMaker.ns + 'AreaMouseDown', [null, this.dom] );
		},

		/* ------------------------------
		 コントローラー
		 ------------------------------*/
		/**
		 * 現在選択されているパーツが変わったとき
		 * @param  {object} e             イベントオブジェクト
		 * @param  {object} characterData キャラクターオブジェクト
		 * @param  {object} dom           操作パネルのDOM
		 */
		ctlCurrentParts: function ( e, characterData, dom ) {
			e.stopPropagation();

			// TODO: 不必要なカスタムイベントかも
			$( e.target ).trigger( animMaker.ns + 'UpdatePanel', [characterData, dom, e.type] );
		},

		 /**
		  * パネルを表示するとき
		  * @param  {object} e             イベントオブジェクト
		  * @param  {object} characterData キャラクターオブジェクト
		  * @param  {object} dom           操作パネルのDOM
		  * @param  {string} eventType     イベントタイプ
		  */
		ctlUpdatePanel: function( e, characterData, dom, eventType ) {
			e.stopPropagation();

			var partsName     = '',
			    partsZIndex   = '',
			    manageAnim    = animMaker.main.manageAnim,
			    currentActive = animMaker.main.fileSelect.data.currentActive,
			    // 操作パネルのDOM
			    dom           = dom || animMaker.main.controlPanel.dom;

			// 操作パネル内のコンテンツの表示・非表示
			self.prototype.renderPanelContent( currentActive, dom.$panelAnims );

			/* コンテンツ組み立て */
			// ページを読み込んだとき or 選択を解除するとき
			if ( ! self.prototype.isInitialize() || animMaker.ns + 'AreaMouseDown' === eventType ) {
				// console.info('controlPanel.ctlUpdatePanel / ページを読み込んだとき or 選択を解除するとき');

				partsName   = BLANK_PARTS_NAME;
				partsZIndex = BLANK_PARTS_ZINDEX;

			// 選択パーツがあるとき
			} else if ( characterData ) {
				// console.info('controlPanel.ctlUpdatePanel / 選択パーツがあるとき');

				// アニメーション操作エリアへ通知する
				manageAnim.dom.$manageAnims.trigger( animMaker.ns + 'updatePanel', [characterData, true] );

				partsName   = characterData.data.file.name;
				partsZIndex = ( animMaker.main.characterCollection.length() - characterData.data.zIndex ) + 1;
			}

			/* 表示 */
			// パーツ名
			self.prototype.renderPartsName    ( partsName,                   dom.$panelPartsName );
			// パーツの重なり
			self.prototype.renderPartsZIndex  ( partsZIndex,                 dom.$panelPartsZIndex );
		},

		/**
		 * アニメーション追加ボタンをクリックしたとき
		 * @param  {object} e イベントオブジェクト
		 */
		ctlAddNewAnimation: function ( e ) {
			e.stopPropagation();
			e.preventDefault();

			var mn               = animMaker.main,
			    cc               = mn.characterCollection,
			    fs               = mn.fileSelect,
			    currentSelectId  = fs.getCurrentActive(),
			    currentPartsData = {};

			// パーツが選択されているか確認する
			if ( ! currentSelectId ) {
				// TODO: デバッグ用
				console.log( '%ccontrolPanel.ctlAddNewAnimation: ', format, 'パーツが選択されていません。' );
				return;
			}

			// 現在選択されているパーツのデータを取得する
			currentPartsData = cc.getCurrentCollectionData( fs.convertId( currentSelectId, mn.data.SELECT_ID, mn.data.PARTS_ID ) );
			//
			animMaker.main.manageAnim.dom.$manageAnims.trigger( animMaker.ns + 'addAnim', [currentPartsData] );
		},

		/**
		 * パーツ削除ボタンをクリックしたとき
		 * @param  {object} e イベントオブジェクト
		 */
		ctlDeleteParts: function ( e ) {
			e.stopPropagation();
			e.preventDefault();

			var cc              = animMaker.main.characterCollection,
			    fs              = animMaker.main.fileSelect,
			    currentSelectId = fs.getCurrentActive(),
			    currentPartsId  = fs.convertId( currentSelectId, animMaker.main.data.SELECT_ID, animMaker.main.data.PARTS_ID );

			if ( ! window.confirm( CONFIRRM_DELETE_PARTS_TEXT ) ) {
				// TODO: デバッグ用
				console.info( 'manageAnim.ctlDeleteAnim: %cパーツ削除キャンセル', format );
				return;
			}

			// コレクションに通知する
			cc.dom.$body.trigger( animMaker.ns + 'DeleteParts', [currentSelectId, currentPartsId] );

			// ビューへ通知する
			animMaker.main.controlPanel.dom.$areaControlPanel.trigger( animMaker.ns + 'UpdatePanel', [null, null, animMaker.ns + 'AreaMouseDown'] );
		},

		/* ------------------------------
		 ビュー
		 ------------------------------*/
		renderPanelContent: function ( currentActive, $panelAnims ) {
			if ( ! currentActive ) {
				$panelAnims.hide();
			} else {
				$panelAnims.fadeIn( 200 );
			}
		},

		 /**
		  * パーツ名を表示する
		  * @param  {string} partsName パーツ名
		  */
		renderPartsName: function ( partsName, $panelPartsName ) {
			$panelPartsName
				.text( partsName )
				.attr( 'title', partsName );
		},

		 /**
		  * 重なり順を表示する
		  * @param  {number} zIndex 重なり順列
		  */
		renderPartsZIndex: function( zIndex, $panelPartsZIndex ) {
			$panelPartsZIndex.text( zIndex );
		},

		/**
		 * アニメーション操作エリアを表示する
		 * @param  {jQUeryObject} $manageAnims
		 * @param  {jQUeryObject} $panelAnims
		 */
		renderAnimOperation: function( $manageAnims, $panelAnims ) {
			$panelAnims.append( $manageAnims );
		},

		/* ------------------------------
		 モデル
		 ------------------------------*/
		 /**
		  * クラスがインスタンス化されているか
		  * @return {Boolean} retVal インスタンス化されていればtrue
		  */
		isInitialize: function () {
			var retVal = false;
			if ( animMaker.main.controlPanel ) retVal = true;
			return retVal;
		},

		/**
		 * 要素をドラッグできるようにする
		 * @param {jQueryObject} $imgPartsWrap 画像を包含するオブジェクト
		 */
		setDraggable: function ( $imgPartsWrap ) {
			// Use jQueryUI Draggable
			this.dom.$areaControlPanel
				.draggable( { zIndex: 9999 } );
		}
	}

	return self;
}() );
