/**
 * @fileoverview
 */

// 名前空間
var animMaker = animMaker || {};

/**
 * キャラクターのパーツを操作するエリア
 * @constructor
 * @classdesc
 */
animMaker.ControlEnemy = ( function () {
	'use strict';

	/* ------------------------------
	 定数
	 ------------------------------*/
	var // パーツが無いときの表示
	    BLANK_DISP          = 'パーツを読み込んでください',
	    // パーツが無いときの表示要素のID
	    BLANK_DISP_ID       = 'comp-enemy__blank',
	    // 操作エリアの背景画像のID
	    CONTROL_ENEMY_BG_ID = 'area-control__enemy-bg';

	/* ------------------------------
	 HTMLテンプレート
	 ------------------------------*/
	//
	var TEMPLATE_BLANK_DISP = [
		'<div id="' + BLANK_DISP_ID + '">',
			BLANK_DISP,
		'</div>'
	].join( '' );

	/* コンストラクタ */
	var self = function ControlEnemy() {
		/* ------------------------------
		 DOMアクセス
		 ------------------------------*/
		this.dom = {};
		/**
		 * キャラクターパーツコントロールエリア(ラッパー)
		 * @type {jQueryObject}
		 */
		this.dom.$areaControlEnemy = $( '#area-control__enemy' );
		/**
		 * キャラクターパーツコントロールエリア
		 * @type {jQueryObject}
		 */
		this.dom.$areaEnemy        = $( '#area-enemy' );

		this.dom.$body             = animMaker.main.dom.$body;

		this.init();
	}

	self.prototype = {
		/**
		 * 初期化する
		 */
		init: function () {
			console.info( 'Class: ControlEnemy.init()' );

			/* ------------------------------
			 イベント
			 ------------------------------*/
			this.dom.$areaEnemy
				// 操作エリアが押されたとき
				.on( 'mousedown',                    this.ctlAreaMouseDown )
				// キャラクターパーツのHTMLが準備完了したとき
				.on( animMaker.ns + 'partsComplete', this.ctlCharacterComplete /* arg: e, $compEnemy */ )
				// クラスを読み込んだ直後
				.on( animMaker.ns + 'classLoaded',   this.renderControlEnemy   /* arg: e */ )
				// 描画を更新するとき
				.on( animMaker.ns + 'partsRender',   this.renderControlEnemy   /* arg: e, $compEnemy */ )
				//
				.on( animMaker.ns + 'BgFileLoaded',  this.ctlSettingBg         /* arg: e, ProgressEv */ );

			this.dom.$areaControlEnemy
				// 操作エリアに設定した画像が押されたとき
				.on( 'mousedown', '#' + CONTROL_ENEMY_BG_ID, this.ctlAreaMouseDown );
		},

		/* ------------------------------
		 コントローラー
		 ------------------------------*/
		/**
		 * キャラクターパーツのHTMLが準備完了したとき
		 * @param  {object} e イベントオブジェクト
		 * @param  {jQueryObject} $compEnemy キャラクターパーツ
		 */
		ctlCharacterComplete: function ( e, $compEnemy ) {
			var $areaEnemy = $( e.target );

			// ビューへ通知
			$areaEnemy.trigger( animMaker.ns + 'partsRender', [$compEnemy] );
		},

		/**
		 * 操作エリアが押されたとき
		 * @param  {object} e イベントオブジェクト
		 */
		ctlAreaMouseDown: function ( e ) {
			e.stopPropagation();

			var mn           = animMaker.main,
			    fileSelect   = mn.fileSelect,
			    controlPanel = mn.controlPanel,
			    currentId, currentData;

			// 選択されているパーツがあるとき
			if ( fileSelect.data.currentActive ) {
				// パーツへ通知する
				currentId  = self.prototype.convertId( fileSelect.data.currentActive, mn.data.SELECT_ID, mn.data.PARTS_ID );
				$( '#' + currentId ).trigger( animMaker.ns + 'AreaMouseDown' );

				// 選択ボタンへ通知する
				// (1) 選択ボタンのアクティブスタイルを削除する
				// (2) 選択要素のIDを解除する
				fileSelect.dom.$areaControlSelect.trigger( animMaker.ns + 'AreaMouseDown' );
			}

			// 現在のパーツのデータを取得する
			// 操作パネルへ通知する
			var characterCollection = animMaker.main.characterCollection;
			currentData = currentId ? characterCollection.getCurrentCollectionData( currentId ) : null;
			controlPanel.dom.$areaControlPanel.trigger( animMaker.ns + 'AreaMouseDown', [currentData] );
		},

		ctlSettingBg: function ( e, progressEv ) {
			e.stopPropagation();

			self.prototype.loadBg( progressEv );

		},

		loadBg: function ( progressEv ) {
			var $img = $( '<img>' ),
			    $areaControlEnemy = animMaker.main.controlEnemy.dom.$areaControlEnemy;

			$img
				.attr( {
					'src': progressEv.target.result,
					'id' : CONTROL_ENEMY_BG_ID
				} );
			$img.on( 'load', function ( e ) {
				self.prototype.renderBg( $( e.target ), $areaControlEnemy );
			} );
		},

		renderBg: function ( $img, $areaControlEnemy ) {
			$img.appendTo( $areaControlEnemy );
		},

		/* ------------------------------
		 ビュー
		 ------------------------------*/
		/**
		 * キャラクターパーツを操作エリアに描画する
		 * @param  {object} e イベントオブジェクト
		 * @param  {jQueryObject} $compEnemy キャラクターパーツ要素
		 */
		renderControlEnemy: function ( e, $compEnemy ) {
			var $areaEnemy = $( e.target );

			if ( ! animMaker.main.characterCollection.length() ) {
				// ブランクテキストを追加する
				$areaEnemy.children()
					.append( TEMPLATE_BLANK_DISP );
			} else {
				// キャラクターパーツを追加する
				$areaEnemy.find( '#' + BLANK_DISP_ID )
					.remove()
					.end()
					.append( $compEnemy );
			}
		},

		/**
		 * id名を変換する
		 * @param  {string} originId
		 * @param  {string} before
		 * @param  {string} after
		 * @return {string}
		 * example 例) upload-file-sub-1 → parts-enemy-sub-1
		 */
		convertId: function ( originId, before, after ) {
			if ( 'string' !== typeof originId ) { return originId; }

			return originId.replace( before, after );
		}
	}

	return self;
}() );
