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
animMaker.ManageAnim = ( function () {
	'use strict';

	/* ------------------------------
	 定数
	 ------------------------------*/
	var // アニメーションパターン
	    animData        = {},
	    // アニメーションパターンのデフォルト値
	    DEFAULT_PATTERN = [{
			name     : 'linear',
			detail   : {
				animationDuration      : 1,
				animationFunction      : 'linear',
				animationDelay         : 0,
				animationIterationCount: 0,
				animationDirection     : 'alternate'
			},
			keyframes: {
				'0'  : 0,
				'100': 0
			},
			misc: {
				origin: 4
			}
		}],
		// 全詳細パネルが開いているか
		detailPanelAllOpen = false,
	    // ベンダープレフィックス
	    CSS_BENDER_PREFIXIES                 = ['-webkit-', '-moz-', ''],
	    // パターン操作エリア
	    MANAGE_ANIM_CLASS_NAME               = 'area-control__manage-anim',
	    // パターン選択エリア
	    SELECT_ANIM_CLASS_NAME               = 'area-control__select-anim',
	    // パターン選択のアイコン
	    SELECT_ANIM_ICON_CLASS_NAME          = 'area-control__select-anim-icon',
	    // アニメーションパターン選択
	    SELECT_ANIM_PATTERN_CLASS_NAME       = 'area-control__select-anim-pattern',
	    // アニメーションコンテキストエリア
	    OPARATION_ANIM_CLASS_NAME            = 'area-control__operation-anim',
	    // アニメーションコンテキストエリア
	    OPARATION_ANIM_MAIN_CLASS_NAME       = 'area-control__operation-anim-main',
	    // アニメーションコンテキストエリア (左)
	    OPARATION_ANIM_MAIN_LEFT_CLASS_NAME  = 'area-control__operation-anim-main-left',
	    // アニメーションコンテキストエリア
	    OPARATION_ANIM_CONTEXT_CLASS_NAME    = 'area-control__operation-anim-context',
	    // アニメーション詳細エリア開閉ボタン
	    OPARATION_BTN_DETAIL_CLASS_NAME      = 'area-control__operation-btn-detail',
	    // アニメーションコンテキストエリア (右)
	    OPARATION_ANIM_MAIN_RIGHT_CLASS_NAME = 'area-control__operation-anim-main-right',
	    // アニメーション削除ボタン
	    DELETE_ANIM_CLASS_NAME               = 'area-control__delete-anim',
	    // アニメーション詳細設定
	    OPARATION_ANIM_DETAIL_CLASS_NAME     = 'area-control__operation-anim-detail',
	    // 活性時クラスネーム
	    CLASS_ACTIVE                         = 'active',
	    // 詳細エリア開閉ボタンのテキスト
	    OPARATION_BTN_DETAIL_TEXT            = '詳細',
	    // アニメーション削除ボタンのテキスト
	    DELETE_ANIM_TEXT                     = 'アニメーションを削除',
	    // アニメーション削除確認のテキスト
	    CONFIRRM_DELETE_ANIM_TEXT            = '本当に削除しますか？';

	/* ------------------------------
	 HTMLテンプレート
	 ------------------------------*/
	// パターン操作エリア
	var TEMPLATE_OPARATION_ANIM = [
		'<div class="' + OPARATION_ANIM_CLASS_NAME + '">',
			'<div class="' + OPARATION_ANIM_MAIN_CLASS_NAME + '">',
				'<div class="' + OPARATION_ANIM_MAIN_LEFT_CLASS_NAME + '">',
					'<div class="' + OPARATION_BTN_DETAIL_CLASS_NAME + '">' + OPARATION_BTN_DETAIL_TEXT + '</div>',
				'</div>',
				'<div class="' + OPARATION_ANIM_MAIN_RIGHT_CLASS_NAME + '">',
				'</div>',
			'</div>',
			'<div class="' + OPARATION_ANIM_DETAIL_CLASS_NAME + '">',
			'</div>',
			'<div class="' + DELETE_ANIM_CLASS_NAME + '"><a href="">' + DELETE_ANIM_TEXT + '</a></div>',
		'</div>'
	].join( '' );

	// パターン選択エリア (アイコン)
	var TEMPLATE_SELECT_ANIM_ICON = [
		'<div class="' + SELECT_ANIM_ICON_CLASS_NAME + '">',
			'<div></div>',
		'</div>'
	].join( '' );

	// パターン選択エリア (選択)
	var TEMPLATE_ANIM_PATERNS = [
		'<select class="' + SELECT_ANIM_PATTERN_CLASS_NAME + '" name="">',
			// '<option value="">---</option>',
			'<% _.each( animPatterns, function( pattern ) { %>',
				'<% if ( currentPattern === pattern.name ) { %>',
					'<option value="<%- pattern.name %>" selected><%- pattern.label %></option>',
				'<% } else { %>',
					'<option value="<%- pattern.name %>"><%- pattern.label %></option>',
				'<% } %>',
			'<% } ) %>',
		'</select>'
	].join( '' );

	// コンテキストエリア (マトリックス入力)
	var TEMPLATE_OPARATION_ANIM_MAIN_CONTEXT_MATRIX = [
		'<div class="' + OPARATION_ANIM_CONTEXT_CLASS_NAME  + ' <%- miscName %>" title="<%- desc %>">',
		'<% _.each( [0,1,2,3,4,5,6,7,8], function( i ) { %>',
				'<label for="transform-origin-<%- index %>-<%- i %>"></label>',
				'<input type="radio" id="transform-origin-<%- index %>-<%- i %>" name="transform-origin-<%- index %>" value="<%- i %>">',
		'<% } ) %>',
		'</div>'
	].join( '' );

	// コンテキストエリア (未使用時)
	var TEMPLATE_OPARATION_ANIM_MAIN_CONTEXT_DEFAULT = [
		'<div class="' + OPARATION_ANIM_CONTEXT_CLASS_NAME  + '">',
		'</div>'
	].join( '' );

	// アニメーションコンテキストエリア (メイン入力)
	var TEMPLATE_OPARATION_ANIM_MAIN_INPUT = [
		// 各アニメーションテンプレート
		'<% _.each( inputParts, function( inputParts ) { %>',
		'<div>',
			'<span><label for="<%- patternName %>-<%- index %>-<%- inputParts.name %>"><%- inputParts.label %></label></span>',
			// 属性値を設定する
			'<% var attrs = ""; %>',
			'<% _.each( inputParts.attr, function( val, key ) { %>',
				'<% attrs += " " + key + "=" + val %>',
			'<% } ) %>',
			'<span><input type="number" id="<%- patternName %>-<%- index %>-<%- inputParts.name %>" name="<%- patternName %>-<%- index %>-<%- inputParts.name %>"<%- attrs %>></span>',
		'</div>',
		'<% } ) %>',
	].join( '' );

	// 詳細入力エリア
	var TEMPLATE_OPARATION_ANIM_DETAIL = [
		'<div>',
			'<span><label for="animationDuration-<%- index %>">進行時間</label></span>',
			'<span><input type="number" min="0" step="0.1" id="animationDuration-<%- index %>" name="animationDuration-<%- index %>" placeholder="整数指定"></span>',
		'</div>',
		'<div>',
			'<span><label for="animationFunction-<%- index %>">進めかた</label></span>',
			'<span>',
				'<select id="animationFunction-<%- index %>" name="animationFunction-<%- index %>">',
					'<option value="linear">一定の速度</option>',
					'<option value="ease">加速→ゆっくり</option>',
					'<option value="ease-in">ゆっくり→徐々に加速</option>',
					'<option value="ease-out">加速→徐々にゆっくり</option>',
					'<option value="ease-in-out">ゆっくり→加速→ゆっくり</option>',
				'</select>',
			'</span>',
		'</div>',
		'<div>',
			'<span><label for="animationDelay-<%- index %>">遅延時間</label></span>',
			'<span><input type="number" min="0" step="0.1" id="animationDelay-<%- index %>" name="animationDelay-<%- index %>" placeholder="負数可"></span>',
		'</div>',
		'<div>',
			'<span><label for="animationIterationCount-<%- index %>">回数</label></span>',
			'<span><input type="number" min="0" step="0.1" id="animationIterationCount-<%- index %>" name="animationIterationCount-<%- index %>" placeholder="無限は0,小数点可"></span>',
		'</div>',
		'<div>',
			'<span><label for="animationDirection-<%- index %>">繰り返しかた</label></span>',
			'<span>',
				'<select id="animationDirection-<%- index %>" name="animationDirection-<%- index %>">',
					'<option value="normal">順方向のみ</option>',
					'<option value="alternate">逆方向あり</option>',
					'<option value="reverse">毎回逆方向</option>',
					'<option value="alternate-reverse">初回は逆方向、次から順方向</option>',
				'</select>',
			'</span>',
		'</div>'
	].join( '' );

	/* コンストラクタ */
	var self = function ManageAnim() {
		/* ------------------------------
		 メンバ
		 ------------------------------*/
		this.data = {
			isFromPanel: false
		};

		/* ------------------------------
		 DOMアクセス
		 ------------------------------*/
		this.dom = {
			/**
			 * HEAD要素
			 * @type {object}
			 */
			$head       : animMaker.main.dom.$head,
			/**
			 * BODY要素
			 * @type {jQueryObject}
			 */
			$body       : animMaker.main.dom.$body,
			/**
			 * アニメーション操作エリア
			 * @type {jQueryObject}
			 */
			$manageAnims: $( '#area-control__manage-anims' )
		};

		this.init();
	}

	/* パブリックメソッド */
	self.prototype = {
		/**
		 * 初期化する
		 */
		init: function () {
			console.info( 'Class: manageAnim.init()' );

			// アニメーションデータ
			// ※パターン選択に使用
			animData.animPatterns = animMaker.data.animPatterns;

			/* ------------------------------
			 イベント
			 ------------------------------*/
			this.dom.$manageAnims
				// パーツがコレクションに追加されたとき
				.on( animMaker.ns + 'AddedParts' + ' ' +
				     animMaker.ns + 'DeleteAnim',                                              this.ctlAnimationSetting /* args: e, currentData */ )

				// パーツがコレクションから削除されたとき
				.on( animMaker.ns + 'DeleteParts',                                             this.ctlremoveStyleAnimation /* args: e, currentData */ )

				// パネルを表示するとき
				.on( animMaker.ns + 'updatePanel',                                             this.ctlUpdateOperation /* args: e, currentData, isFromPanel */ )

				// アニメーションが追加されたとき
				.on( animMaker.ns + 'addAnim',                                                 this.ctlAddAnim )

				// アニメーションパターンを変更したとき
				.on( 'change',                     '.' + SELECT_ANIM_PATTERN_CLASS_NAME,       this.ctlChangePattern )

				// コンテキスト内の入力を変更したとき
				.on( 'change',                     '.' + OPARATION_ANIM_CONTEXT_CLASS_NAME,    this.ctlChangeContextInput )

				// メイン操作内の入力を変更したとき
				.on( 'change',                     '.' + OPARATION_ANIM_MAIN_RIGHT_CLASS_NAME, this.ctlChangeMainInput )

				// 詳細内の入力を変更したとき
				.on( 'change',                     '.' + OPARATION_ANIM_DETAIL_CLASS_NAME,     this.ctlChangeDetailInput )

				// 詳細ボタンをクリックしたとき
				.on( 'click',                      '.' + OPARATION_BTN_DETAIL_CLASS_NAME,      this.ctlShowDetail )

				// 詳細ボタンをダブルクリックしたとき
				.on( 'dblclick',                   '.' + OPARATION_BTN_DETAIL_CLASS_NAME,      this.ctlShowAllDetail )

				// アニメーション削除ボタンをクリックしたとき
				.on( 'click',                      '.' + DELETE_ANIM_CLASS_NAME,               this.ctlDeleteAnim );
		},

		/* ------------------------------
		 コントローラー
		 ------------------------------*/
		/**
		 * 操作パネルが初期化されたとき
		 * @param  {object} e           イベントオブジェクト
		 * @param  {object} currentData キャラクターパーツデータ
		 */
		ctlAnimationSetting: function ( e, currentData ) {
			e.stopPropagation();

			// パーツのアニメーションを作成する
			self.prototype.createStyleAnimations( currentData );
		},

		ctlremoveStyleAnimation: function ( e, currentData ) {
			e.stopPropagation();

			// パーツのアニメーションを削除する
			animMaker.main.manageAnim.removeStyleAnimation( currentData.get( 'id' ) );
		},

		/**
		 * パネルを表示するとき
		 * @param  {object} e           イベントオブジェクト
		 * @param  {object} currentData キャラクターパーツデータ
		 */
		ctlUpdateOperation: function ( e, currentData, isFromPanel ) {
			e.stopPropagation();

			animMaker.main.manageAnim.data.isFromPanel = isFromPanel;

			// パネル内のアニメーション操作エリアを構築する
			self.prototype.createAnims( currentData );

			animMaker.main.manageAnim.data.isFromPanel = false;
		},

		/**
		 * アニメーションパターンを変更したとき
		 * @param  {object} e イベントオブジェクト
		 */
		ctlChangePattern: function ( e ) {
			e.stopPropagation();
			e.preventDefault();

			var $target     = $( e.target ),
			    $manageAnim = $target.closest( '.' + MANAGE_ANIM_CLASS_NAME ),
			    currentData = self.prototype.getCurrentData(),
			    patternName = $target.val(),
			    index       = $manageAnim.index();

			// パターン再選択時
			if ( ! animMaker.main.manageAnim.data.isFromPanel ) {
				var currentAnimDefault = {},
				    anims          = {};

				// アニメーションパターン設定からデフォルトデータを作成する
				currentAnimDefault = self.prototype.createAnimDefaultData( self.prototype.getCurrentAnimPattern( patternName ) );
				// 現在のアニメーションデータを作成したデフォルトデータで書き換える
				// $.extend( true, currentData.getAnim( index ), currentAnimDefault );
				anims        = currentData.getAnim();
				anims[index] = currentAnimDefault;
			}

			// アニメーション設定エリアに現在のパターンのクラスを追加
			self.prototype.addPatternClass( patternName, $manageAnim );
			// アニメーション設定エリアを作成する
			self.prototype.createOperation( patternName, $manageAnim );

			// スタイル要素を削除する
			animMaker.main.manageAnim.dom.$manageAnims.trigger( animMaker.ns + 'DeleteAnim', [currentData] );
		},

		/**
		 * コンテキスト内の入力を変更したとき
		 * @param  {object} e             イベントオブジェクト
		 */
		ctlChangeContextInput: function ( e ) {
			e.stopPropagation();
			e.preventDefault();

			var $target     = $( e.target ),
			    currentData = self.prototype.getCurrentData(),
			    splitedName = $target.attr( 'name' ).split( '-' ),
			    value       = $target.val();

			if ( currentData ) {
				currentData.setStyle( splitedName[1], parseFloat( value, 10 ), 'misc', parseFloat( splitedName[2], 10 ) );
				self.prototype.createStyleAnimations( currentData );
				self.prototype.renderCurrentActive( $target );
			}

			// 表示

		},

		/**
		 * 内の入力を変更したとき
		 * @param  {object} e             イベントオブジェクト
		 */
		ctlChangeMainInput: function ( e ) {
			e.stopPropagation();
			e.preventDefault();

			var $target     = $( e.target ),
			    currentData = self.prototype.getCurrentData(),
			    splitedName = $target.attr( 'name' ).split( '-' ),
			    value       = $target.val();

			if ( currentData ) {
				currentData.setStyle( splitedName[2], parseFloat( value, 10 ), 'keyframes', parseFloat( splitedName[1], 10 ) );
				// パーツのアニメーションを作成する
				self.prototype.createStyleAnimations( currentData );
			}
		},

		/**
		 * 内の入力を変更したとき
		 * @param  {object} e             イベントオブジェクト
		 */
		ctlChangeDetailInput: function ( e ) {
			e.stopPropagation();
			e.preventDefault();

			var $target     = $( e.target ),
			    currentData = self.prototype.getCurrentData(),
			    splitedName = $target.attr( 'name' ).split( '-' ),
			    value       = $target.val();

			if ( currentData ) {
				// プロパティによって数値に変換する
				if ( -1 === value.search( /[a-zA-Z]/ ) ) {
					value = parseFloat( value, 10 );
				}

				currentData.setStyle( splitedName[0], value, 'detail', parseFloat( splitedName[1], 10 ) );
				// パーツのアニメーションを作成する
				self.prototype.createStyleAnimations( currentData );
			}
		},

		/**
		 * 詳細ボタンをクリックしたとき
		 * @param  {object} e             イベントオブジェクト
		 */
		ctlShowDetail: function ( e ) {
			e.stopPropagation();
			e.preventDefault();

			var $oparationAnimDetails = $('.' + OPARATION_ANIM_DETAIL_CLASS_NAME );
			var $oparationAnimDetail = $( e.target ).closest('.' + OPARATION_ANIM_MAIN_CLASS_NAME ).next();

			self.prototype.renderDetail( $oparationAnimDetail, $oparationAnimDetails );
		},

		/**
		 * 詳細ボタンをダブルクリックしたとき
		 * @param  {object} e             イベントオブジェクト
		 */
		ctlShowAllDetail: function ( e ) {
			e.stopPropagation();
			e.preventDefault();

			var $oparationAnimDetail = $('.' + OPARATION_ANIM_DETAIL_CLASS_NAME );

			self.prototype.renderAllDetail( $oparationAnimDetail );
		},

		/**
		 * アニメーションが追加されたとき
		 * @param  {object} e             イベントオブジェクト
		 * @param  {object} characterData パーツオブジェクト
		 */
		ctlAddAnim: function ( e, characterData ) {
			e.stopPropagation();
			e.preventDefault();

			var animPatterns = [];

			// 新規アニメーションパターンデータを追加する
			animPatterns = self.prototype.addAnimPattern( characterData );
			// 新規アニメーション操作エリアを表示する
			self.prototype.createAnim( animPatterns );
		},

		/**
		 * パーツ削除ボタンをクリックしたとき
		 * @param  {object} e             イベントオブジェクト
		 */
		ctlDeleteAnim: function ( e ) {
			e.stopPropagation();
			e.preventDefault();

			var $target     = $( e.target ),
			    $manageAnim = $target.closest( '.' + MANAGE_ANIM_CLASS_NAME ),
			    currentData = self.prototype.getCurrentData(),
			    index       = $manageAnim.index();

			if ( ! window.confirm( CONFIRRM_DELETE_ANIM_TEXT ) ) {
				// TODO: デバッグ用
				console.info( 'manageAnim.ctlDeleteAnim: %cアニメーションパターン削除キャンセル', format );
				return;
			}

			// アニメーションパターンを削除する
			// (再描画イベント発生)
			currentData.deleteAnim( index );

			// 操作エリアを削除する
			self.prototype.remove( $manageAnim );

			// スタイル要素を削除する
			animMaker.main.manageAnim.dom.$manageAnims.trigger( animMaker.ns + 'DeleteAnim', [currentData] );
		},

		/* ------------------------------
		 ビュー
		 ------------------------------*/
		 /**
		  * 現在の選択をハイライトするする
		  * @param  {jQueryObject} $target 要素
		  */
		renderCurrentActive: function ( $target ) {
			// 全削除
			self.prototype.renderDeleteActive( $target );
			// クラス付与
			$target.prev().addClass( CLASS_ACTIVE );
		},

		/**
		 * 要素のハイライトを削除する
		 * @param  {jQueryObject} $target 要素
		 */
		renderDeleteActive: function ( $target ) {
			$target.siblings().removeClass( CLASS_ACTIVE );
		},

		/**
		 * アニメパターンの選択エリアを表示する
		 * @param  {jQUeryObject} $selectAnim 選択エリア
		 * @param  {jQUeryObject} $manageAnim 選択エリアを追加・表示するエリア
		 */
		renderAnimPattern: function ( $selectAnim, $manageAnim ) {
			var $manageAnims = animMaker.main.manageAnim.dom.$manageAnims;

			$manageAnim
				.append( $selectAnim )
				.appendTo( $manageAnims );
		},

		/**
		 * アニメーション操作エリアを表示する
		 * @param  {jQUeryObject} $operationAnim 操作エリア
		 * @param  {jQUeryObject} $manageAnim 操作エリアを追加・表示するエリア
		 */
		renderOperation: function ( $operationAnim, $manageAnim ) {
			$manageAnim
				.find( '.' + OPARATION_ANIM_CLASS_NAME )
					.remove()
				.end()
					.append( $operationAnim );
		},

		/**
		 * 詳細パネルを表示・非表示する
		 * @param  {jQUeryObject} $oparationAnimDetail  詳細パネル要素
		 * @param  {jQUeryObject} $oparationAnimDetails 全詳細パネル要素
		 */
		renderDetail: function ( $oparationAnimDetail, $oparationAnimDetails ) {
			var isOpens     = 0,
			    panelLength = $oparationAnimDetails.length;

			$oparationAnimDetail
				.toggleClass( 'detail-panel-open' )
				.slideToggle( 'fast' );

			$oparationAnimDetails.each( function ( i, el ) {
				var isOpen = $( el ).hasClass( 'detail-panel-open' );

				// 開いている詳細パネル数
				if ( isOpen ) { isOpens += 1; }

				// 全詳細パネルが開いているか
				if ( panelLength === isOpens ) {
					detailPanelAllOpen = true;
				} else {
					detailPanelAllOpen = false;
				}
			} );
		},

		/**
		 * 全詳細パネルを表示・非表示する
		 * @param  {jQUeryObject} $oparationAnimDetail 詳細パネル要素
		 */
		renderAllDetail: function ( $oparationAnimDetail ) {
			if ( detailPanelAllOpen ) {
				$oparationAnimDetail.slideUp( 'fast' ).removeClass( 'detail-panel-open' );
				detailPanelAllOpen = false;
			} else {
				$oparationAnimDetail.slideDown( 'fast' ).addClass( 'detail-panel-open' );
				detailPanelAllOpen = true;
			}
		},

		/**
		 * DOMにスタイルを追加する
		 * @param  {array} styles スタイル
		 */
		renderStyleAnimation: function ( styles, animationName ) {
			var $head  = animMaker.main.manageAnim.dom.$head,
			    $style = $( '<style>' );

			$style
				.addClass( animationName )
				.html( styles )
				.appendTo( $head );
		},

		/**
		 * アニメーション操作エリアを削除する
		 * @param  {jQUeryObject} $manageAnim 操作エリアを追加・表示するエリア
		 */
		remove: function ( $manageAnim ) {
			$manageAnim.remove();
		},

		/**
		 * スタイル要素を削除する
		 * @param  {string} animationName 削除するスタイル要素のクラス名
		 */
		removeStyleAnimation: function ( animationName ) {
			var $head  = animMaker.main.manageAnim.dom.$head;

			$head
				.find( '.' + animationName )
				.remove()
		},

		/* ------------------------------
		 モデル
		 ------------------------------*/
		/**
		 * 現在選択されているパーツのデータを取得する
		 * @return {object|boolean} currentData 現在選択されているパーツのデータ
		 *     または取得失敗時にはfalse
		 */
		getCurrentData: function () {
			var mn               = animMaker.main,
			    cc               = mn.characterCollection,
			    fs               = mn.fileSelect,
			    currentSelectId  = fs.getCurrentActive(),
			    currentData      = {};

			currentData = cc.getCurrentCollectionData( fs.convertId( currentSelectId, mn.data.SELECT_ID, mn.data.PARTS_ID ) );
			return currentData ? currentData : false;
		},

		getCurrentAnimPattern: function ( patternName ) {
			return animMaker.data.animPatterns[patternName];
		},

		/**
		 * アニメーション操作エリアを登録アニメーション分作成する
		 * @param {object} currentData 現在選択されているパーツのデータ
		 */
		createAnims: function ( currentData ) {
			var $manageAnims = animMaker.main.manageAnim.dom.$manageAnims,
			    animPatterns = [];

			// 一旦、初期化
			$manageAnims.empty();
			// アニメーションパターンを取得する
			animPatterns = currentData.getAnim();
			// アニメーションパターン数回ループする
			$.each( animPatterns, function ( i, patterns ) {
				self.prototype.createAnim( patterns );
			} );
		},

		/**
		 * アニメーション操作エリアを作成する
		 * @param  {object} patterns アニメーションパターン
		 */
		createAnim: function ( patterns ) {
			// 登録パターン数ループする
				var $manageAnim  = $( '<div class="' + MANAGE_ANIM_CLASS_NAME + '">' ),
				    $selectAnim;

				// アニメパターンの要素を構築する
				$selectAnim = self.prototype.createAnimPattern( patterns );
				// アニメパターンの選択エリアを表示する
				self.prototype.renderAnimPattern( $selectAnim, $manageAnim );
				// パターン選択イベントを通知する
				$selectAnim.find( '.' + SELECT_ANIM_PATTERN_CLASS_NAME ).trigger( 'change', [patterns] );
		},

		/**
		 * アニメーション選択エリアを作成する
		 * @param  {object} patterns アニメーションパターン
		 * @return {jQueryObject} $selectAnim アニメーション選択エリア
		 */
		createAnimPattern: function ( patterns ) {
			var $selectAnim = $( '<div class="' + SELECT_ANIM_CLASS_NAME + '">' ),
			    compiled    = _.template( TEMPLATE_ANIM_PATERNS );

			// セーブされていたたパターンを一時代入する
			animData.currentPattern = patterns.name;
			// 構築
			$selectAnim
				.append( TEMPLATE_SELECT_ANIM_ICON )
				.append( compiled( animData ) );
			// 削除する
			delete animData.currentPattern;

			return $selectAnim;
		},

		/**
		 * アニメーション操作エリアを作成する
		 * @param  {string} patternName 現在選択されているアニメーションパターン名
		 * @param  {jQueryObject} $manageAnim 操作エリアを追加・表示するエリア
		 */
		createOperation: function ( patternName, $manageAnim ) {
			// var data               = animData.animPatterns[patternName],
			var data               = self.prototype.getCurrentAnimPattern( patternName ),
			    index              = $manageAnim.index(),
			    currentData        = {},
			    anim               = {},
			    $operationAnim     = $( TEMPLATE_OPARATION_ANIM ),
			    $operationAnimMain = $operationAnim.children( '.' + OPARATION_ANIM_MAIN_CLASS_NAME ),
			    $operation_anim_main_left,
			    $operation_anim_main_right,
			    $operation_anim_detail;

			// 一時的に追加、クラス名に使用する
			data.index = index;

			// 要素準備
			$operation_anim_main_left  = self.prototype.createOperationLeft( $operationAnim, patternName, data );
			$operation_anim_main_right = self.prototype.createOperationRight( $operationAnim, patternName, data );
			$operation_anim_detail     = self.prototype.createOperationDetail( $operationAnim, patternName, data );
			$operationAnimMain.prepend( $operation_anim_main_left, $operation_anim_main_right );
			$operationAnim.prepend( $operationAnimMain, $operation_anim_detail );

			// アニメーション操作エリアを表示する
			self.prototype.renderOperation( $operationAnim, $manageAnim );

			// パーツデータを取得する
			currentData = self.prototype.getCurrentData();
			anim        = currentData.getAnim( index );

			if ( anim ) {
				// データに基づいて表示を更新する
				self.prototype.updateAnimValues( anim, $operationAnim );
			}

			// 削除する
			delete data.index;
		},

		/**
		 * コンテキストエリア (左)を作成する
		 * @param  {jQueryObject} $operationAnim 操作エリア
		 * @param  {string} patternName 現在選択されているアニメーションパターン名
		 * @param  {} data 現在選択されているアニメーションパターンデータ
		 * @return {jQueryObject} $operation_anim_main_left コンテキストエリア (左)
		 */
		createOperationLeft: function ( $operationAnim, patternName, data ) {
			var $operation_anim_main_left = $operationAnim.find( '.' + OPARATION_ANIM_MAIN_LEFT_CLASS_NAME ),
			    compiled,
			    $context;

			// クラス名を付与するため一時的にプロパティを追加する
			// ※data.misc以下のプロパティが必ず一つの前提
			for ( var propName in data.misc ) {
				data.miscName = propName;
				break;
			}

			switch( patternName ) {
			case 'linear':
			case 'arc':
			case 'scale':
				compiled = _.template( TEMPLATE_OPARATION_ANIM_MAIN_CONTEXT_MATRIX );
				$context = compiled( data );
				break;
			default:
				compiled = _.template( TEMPLATE_OPARATION_ANIM_MAIN_CONTEXT_DEFAULT );
				$context = compiled();
				break;
			}

			// クラス名を付与するため一時的に追加したプロパティを削除する
			delete data.miscName;

			$operation_anim_main_left.prepend( $context );
			return $operation_anim_main_left;
		},

		/**
		 * コンテキストエリア (右)を作成する
		 * @param  {jQueryObject} $operationAnim             操作エリア
		 * @param  {string}       patternName                現在選択されているアニメーションパターン名
		 * @param  {object}       data                       現在選択されているアニメーションパターンデータ
		 * @return {jQueryObject} $operation_anim_main_right コンテキストエリア (右)
		 */
		createOperationRight: function ( $operationAnim, patternName, data ) {
			var $operation_anim_main_right = $operationAnim.find( '.' + OPARATION_ANIM_MAIN_RIGHT_CLASS_NAME ),
			    compiled                   = _.template( TEMPLATE_OPARATION_ANIM_MAIN_INPUT );

			data.patternName = patternName;
			$operation_anim_main_right.append( compiled( data ) );
			delete data.patternName;
			return $operation_anim_main_right;
		},

		/**
		 * 詳細エリアを作成する
		 * @param  {jQueryObject} $operationAnim         操作エリア
		 * @param  {string}       patternName            現在選択されているアニメーションパターン名
		 * @param  {object}       data                   現在選択されているアニメーションパターンデータ
		 * @return {jQueryObject} $operation_anim_detail 詳細エリア
		 */
		createOperationDetail: function ( $operationAnim, patternName, data ) {
			var $operation_anim_detail = $operationAnim.find( '.' + OPARATION_ANIM_DETAIL_CLASS_NAME ),
			    compiled_input         = _.template( TEMPLATE_OPARATION_ANIM_DETAIL );

			data.patternName = patternName;
			$operation_anim_detail.append( compiled_input( data ) );
			delete data.patternName;
			return $operation_anim_detail;
		},

		/**
		 *
		 * @param  {object}       anim           アニメーションパターン
		 * @param  {jQueryObject} $operationAnim アニメーション操作エリア要素
		 */
		updateAnimValues: function ( anim, $operationAnim ) {
			// コンテキストエリアの値を更新する
			self.prototype.updateContextValues( anim, $operationAnim );
			// メイン操作エリアの値を更新する
			self.prototype.updateMainValues( anim, $operationAnim );
			// 詳細エリアの値を更新する
			self.prototype.updateDetailValues( anim, $operationAnim );
		},

		/**
		 *
		 * @param  {object}       anim           アニメーションパターン
		 * @param  {jQueryObject} $operationAnim アニメーション操作エリア要素
		 */
		updateContextValues: function ( anim, $operationAnim ) {
			switch( anim.name ) {
			case 'linear':
			case 'arc':
			case 'scale':
				var origin  = isNaN( anim.misc.origin ) ? 4 : anim.misc.origin,
				    $target = $operationAnim
						.find( '.' + OPARATION_ANIM_CONTEXT_CLASS_NAME )
						.find( 'input' )
						.eq( origin )
						.prop( 'checked', true );

				// 表示
				self.prototype.renderCurrentActive( $target );
				break;

			default:
				break;
			}
		},

		/**
		 *
		 * @param  {object}       anim           アニメーションパターン
		 * @param  {jQueryObject} $operationAnim アニメーション操作エリア要素
		 */
		updateMainValues: function ( anim, $operationAnim ) {
			var $oparationAnimMainRight = $operationAnim.find( '.' + OPARATION_ANIM_MAIN_RIGHT_CLASS_NAME );
			$.each( anim.keyframes, function ( propName, propVal ) {
				$oparationAnimMainRight
					.find( '[name$=' + propName + ']' )
					.val( propVal );
			} );
		},

		/**
		 *
		 * @param  {object}       anim           アニメーションパターン
		 * @param  {jQueryObject} $operationAnim アニメーション操作エリア要素
		 */
		updateDetailValues: function ( anim, $operationAnim ) {
			var $oparationAnimDetail = $operationAnim.find( '.' + OPARATION_ANIM_DETAIL_CLASS_NAME );

			$.each( anim.detail, function ( propName, propVal ) {
				$oparationAnimDetail
					.find( '[name^=' + propName + ']' )
					.val( propVal );
			} );
		},

		/**
		 * 新規アニメーションパターンを登録する
		 * @param  {object} currentData 現在選択されているパーツデータ
		 * @return {array} 新規アニメーションパターンを登録したアニメーションデータ
		 */
		addAnimPattern: function ( currentData ) {
			var clone = $.extend( true, [], DEFAULT_PATTERN );

			// デフォルト値
			currentData.setAnimItems( clone );
			return currentData.getAnim();
		},

		/**
		 * クラス名に現在選択されているアニメーションパターン名を追加する
		 * @param  {string} patternName 現在選択されているアニメーションパターン名
		 * @param  {jQueryObject} $manageAnim クラスを追加するエリア
		 */
		addPatternClass: function ( patternName, $manageAnim ) {
			var delimiter  = ' ',
			    classNames = $manageAnim.attr( 'class' ).split( delimiter );

			$manageAnim
				.removeClass()
				.addClass( classNames[0] + delimiter + patternName );
		},

		/**
		 * 文字列に接頭辞または接尾辞を追加する
		 * @param {string} str    変更する文字列
		 * @param {string} addStr 追加する文字列
		 * @param {string} prefix 接頭辞かどうか
		 * @return {string} addedStr 変更した文字列
		 */
		addStr: function ( str, addStr, prefix ) {
			var addedStr = '';

			if ( prefix ) {
				addedStr = addStr + str;
			} else {
				addedStr = str + addStr;
			}
			return addedStr;
		},

		/**
		 * スタイルにベンダープレフィックスを付与する
		 * @param {string} target      ベンダープレフィックスを付与するプロパティ
		 * @param {string} prefixies   ベンダープレフィックス
		 * @return {array|string} addedPrefix ベンダープレフィックスを付与したプロパティの配列または文字列
		 */
		addPrefix: function ( target, prefixies, usestr, joinStr,  keyframes ) {
			var addedPrefix = [],
			    at          = '',
			    TAB         = '\t';

			if ( ! target || ! prefixies ) { return target; }


			$.each( prefixies, function ( i, prefix ) {
				if ( keyframes && prefix ) { at = '@'; }

				addedPrefix.push( at + prefix + target );

				at = '';
			} );

			if ( usestr ) {
				return addedPrefix.join( joinStr );
			}

			return addedPrefix;
		},

		/**
		 * アニメーションパターン設定からデフォルトデータを作成する
		 * @param  {object} currentAnimPattern アニメーションパターン
		 * @return {object} currentAnimDefault アニメーションパターンのデフォルト値のオブジェクト
		 */
		createAnimDefaultData: function ( currentAnimPattern ) {
			var currentAnimDefault = {};

			$.each( currentAnimPattern, function ( propName, propVal ) {
				switch ( propName ) {
				case 'name':
					currentAnimDefault[propName] = propVal;
					break;

				case 'initial':
					currentAnimDefault['detail'] = $.extend( true, {}, propVal );
					break;

				case 'inputParts':
					var keyframes = {};
					$.each( propVal, function ( partsInd, partsVal ) {
						keyframes[partsVal.name] = partsVal.attr.value;
					} );
					currentAnimDefault['keyframes'] = $.extend( true, {}, keyframes );
					break;

				case 'misc':
					currentAnimDefault[propName] = $.extend( true, {}, propVal );
					break;
				}
			} );

			return currentAnimDefault;
		},

		/**
		 * パーツのアニメーションを作成する
		 * @param  {object} currentData パーツデータ
		 */
		createStyleAnimations: function ( currentData ) {
			var partsId     = currentData.get( 'id' ),
			    animations  = {},
			    styles      = '';

			// 一旦、パーツのスタイルを全削除する
			self.prototype.removeStyleAnimation( partsId );

			// アニメーションパターンが無ければ処理しない
			if ( 0 === currentData.getAnim().length ) { return; }

			// animationsにスタイルを生成、代入する (参照渡し)
			$.each( currentData.getAnim(), function ( index, pattern ) {
				self.prototype.createStyleAnimationData( animations, pattern, index, partsId );
			} );

			// スタイルを作成する
			styles = self.prototype.createStyleAnimation( animations, partsId );

			// DOMにスタイルを追加する
			self.prototype.renderStyleAnimation( styles, partsId );
		},

		createStyleAnimation: function ( animations, partsId ) {
			var LB                = '\n',
			    TAB               = '\t',
			    TARGET_EL         = 'img',
			    BRANCKET_START    = ' { ' + LB,
			    BRANCKET_END      = '}' + LB,
			    SELECTOR_START    = '#' + partsId + ' ' + TARGET_EL + BRANCKET_START,
			    PROP_END          = ';' + LB,
			    JOIN_STR          = ', ',
			    PROP_START        = ': ',
			    TF_PROP           = 'transform' + PROP_START,
			    ORIGIN_PROP       = 'transform-origin' + PROP_START,
			    ANIMATION_PROP    = 'animation' + PROP_START,
			    animationName     = '',
			    styleData         = {},
			    advancedStyleData = {},
			    keyframes         = {},
			    tfOrigin          = {},
			    retStyle          = [];

			// スタイル用データ作成1
			$.each( animations, function ( typeName, typeObj ) {
				$.each( typeObj, function ( index, pattern ) {
					$.each( pattern, function ( propName, propVal ) {

						// 処理しない
						if ( 'type' === propName ) { return; }

						// 初期化
						styleData[pattern.type] = styleData[pattern.type] ? styleData[pattern.type] : {};
						if ( ! styleData[pattern.type][propName] ) {
							if ( 'animations' === propName || 'keyframes' === propName ) {
								styleData[pattern.type][propName] = {};
							}
							else {
								// transform以外はtransform-originを設定しない
								if ( 'transform' !== typeName && 'origins' === propName ) { return; }

								styleData[pattern.type][propName] = [];
							}
						}

						// 代入
						if ( 'animations' === propName || 'keyframes' === propName ) {
							self.prototype.reconstructProps( styleData[pattern.type], propName, propVal );
						}
						else if ( 'origins' === propName ) {
							// 直線運動はスタイルで直接設定するため除外する
							if ( 'transform' === typeName && 'linear' !== pattern.patternName ) {
								styleData[pattern.type][propName].push( propVal );
							}
						}
					} );
				} );
			} );

// console.log( '%ccreateStyleAnimations [styleData]: ', format, styleData );

			// スタイル用データ作成2
			$.each( styleData, function ( typeName, typeObj ) {
				$.each( typeObj, function ( name, pattern ) {
					if ( 'keyframes' === name ) {
						$.each( pattern, function ( propName, propVal ) {
							typeObj[name][propName] = self.prototype.addPrefix( typeName + ': ' + propVal.join( ' ' ), CSS_BENDER_PREFIXIES, false );
						});
					}

					else if ( 'animations' === name ) {
						$.each( pattern, function ( propName, propVal ) {
							typeObj[name][propName] = propVal[0];
						});
						animationName = partsId + '-' + typeName + '-' + ( new Date ).getTime();

						typeObj[name]['animationName'] = animationName;
						typeObj[name] = typeObj[name]['animationName']           + ' ' +
										typeObj[name]['animationDuration']       + ' ' +
										typeObj[name]['animationFunction']       + ' ' +
										typeObj[name]['animationDelay']          + ' ' +
										typeObj[name]['animationIterationCount'] + ' ' +
										typeObj[name]['animationDirection'];
					}

					else if ( 'origins' === name ) {
						typeObj[name] = pattern[0];
					}

					advancedStyleData[name] = advancedStyleData[name] ? advancedStyleData[name] : [];
					advancedStyleData[name].push( typeObj[name] );
				} );

				$.each( typeObj, function ( name, pattern ) {
					if ( 'keyframes' === name ) {
						keyframes[typeName] = keyframes[typeName] ? keyframes[typeName] : [];

						// スタイル
						keyframes[typeName].push( name + ' ' + animationName + BRANCKET_START );

						$.each( pattern, function ( propName, propVal ) {
							propVal = propVal.join( PROP_END );
							keyframes[typeName].push( TAB + propName + BRANCKET_START + propVal + BRANCKET_END );
						} );

						keyframes[typeName].push( BRANCKET_END );
					}

					else if ( 'animations' === name ) {
					}

					else if ( 'origins' === name ) {
					}
				} );
			} );

// console.log( '%ccreateStyleAnimations [advancedStyleData]: ', format, advancedStyleData );

			// データを元に出力形式にする
			// Animationスタイル
			retStyle.push( SELECTOR_START );
			retStyle.push( self.prototype.addPrefix( ANIMATION_PROP + advancedStyleData.animations.join( JOIN_STR ) + PROP_END, CSS_BENDER_PREFIXIES, true, '' ) );
			// transform-origin (必要なら)
			if ( advancedStyleData.origins && 0 !== advancedStyleData.origins.length ) {
				retStyle.push( self.prototype.addPrefix( ORIGIN_PROP + advancedStyleData.origins.join( JOIN_STR ) + PROP_END, CSS_BENDER_PREFIXIES, true, '' ) );
			}
			retStyle.push( BRANCKET_END );

			// Keyframesスタイル
			$.each( keyframes, function ( typeName, typeObj ) {
				retStyle.push( self.prototype.addPrefix( typeObj.join( '' ), CSS_BENDER_PREFIXIES, true, '', true ) );
			} );

			return retStyle;
		},

		/**
		 * データを組み替える
		 * @param  {object} styleProps スタイルを格納するオブジェクト
		 * @param  {string} propName   プロパティ名
		 * @param  {object} propVal    プロパティ内の複数の値
		 */
		reconstructProps: function ( styleProps, propName, propVal ) {
			$.each( propVal, function ( name, val ) {
				styleProps[propName][name] = styleProps[propName][name] ? styleProps[propName][name] : [];
				styleProps[propName][name].push( val );
			} );
		},

		/**
		 * パーツデータからアニメーションを作成しDOMに追加する
		 * @param {object} animations
		 * @param {object} props        パーツのアニメーションデータ
		 * @param {number} index        パーツの何番目のアニメーションか
		 * @param {object} partsId      パーツデータ
		 */
		createStyleAnimationData: function ( animations, props, index, partsId ) {
			var patternName = props.name,
			    type        = self.prototype.getCurrentAnimPattern( patternName ).type,
			    typeLen;

			//
			if ( ! animations[type] ) animations[type] = [];
			typeLen = animations[type].length;
			animations[type][typeLen] = {};

			// アニメーションのタイプ ( tarnsform, filter, etc.. )
			animations[type][typeLen]['type']       = type;

			animations[type][typeLen]['patternName']       = patternName;

			// コンテキストの値を取得する
			animations[type][typeLen]['origins']    = self.prototype.createStyleTfOrigin( props.misc.origin );

			// アニメーションの実行前や実行後にどのようなスタイルを適用するかを設定する
			// animations[type][typeLen]['fillModes']  = self.prototype.createStyleAnimationFillMode();

			// アニメーション (animation) を作成する
			animations[type][typeLen]['animations'] = self.prototype.createAnimation( props );

			// キーフレーム (keyframes) 作成
			animations[type][typeLen]['keyframes']  = self.prototype.createKeyframes( props );
		},

		/**
		 * 'animation-fill-mode'を取得する
		 * @return {stirng} fillMode animation-fill-modeプロパティ
		 */
		createStyleAnimationFillMode:  function () {
			var fillMode = 'animation-fill-mode: both';
			return fillMode;
		},

		/**
		 * @param  {number} originVal 位置指定用数値
		 * @param  {string} originVal プロパティ設定値
		 */
		createStyleTfOrigin: function ( originVal ) {
			if ( 'number' === typeof originVal ) {
				originVal = self.prototype.convertTransformOrigin( originVal );
				return originVal;
			} else {
				return 'center center';
			}
		},

		/**
		 *
		 * @param  {} propVal
		 * @return {}
		 */
		convertTransformOrigin: function ( propVal ) {
			var tfMapData = [ 'left top', 'center top', 'right top', 'left center', 'center center', 'right center', 'left bottom', 'center bottom', 'right bottom' ];

			return tfMapData[ propVal ] ? tfMapData[ propVal ] : 'center center';
		},

		/**
		 *
		 * @param  {} addedProps
		 * @return {}
		 */
		createAnimation: function ( addedProps ) {
			var animation = {};

			$.each( addedProps.detail, function ( propName, propVal ) {
				switch ( propName ) {
				case 'animationDuration':
				case 'animationDelay':
					// 値を成形
					propVal = self.prototype.addStr( propVal, 's' );
					break;

				case 'animationIterationCount':
					// 値を成形
					if ( 0 === propVal ) {
						propVal = 'infinite';
					}
					break;
				}
				animation[propName] = propVal;
			} );

			return animation;
		},

		createKeyframes: function ( pattern ) {
			var retKeyframes = {};

			$.each ( pattern.keyframes, function ( patternName, patternVal ) {
				var patternName = self.prototype.addStr( patternName, '%' );
				retKeyframes[patternName] = self.prototype.createKeyframesProp( pattern, patternVal );
			} );

			return retKeyframes;
		},

		/**
		 *
		 * @param  {object} pattern
		 * @param  {} patternVal
		 * @return {}
		 */
		createKeyframesProp: function ( pattern, patternVal ) {
			var createdProp = '';
// console.log( pattern.misc );

			switch ( pattern.name ) {

			// TRANSFORM
			case 'linear': // 直線運動
				createdProp = self.prototype.createKeyframesPropLinear( 'translate', patternVal, pattern.misc );
				break;

			case 'arc':
				createdProp = self.prototype.createKeyframesPropArc( 'rotate', patternVal );
				break;

			case 'circle':
				break;

			case 'scale':
				createdProp = self.prototype.createKeyframesPropScale( 'scale', patternVal );
				break;

			// FILTER
			case 'opacity':
				createdProp = self.prototype.createKeyframesPropFilterOpacity( pattern.name, patternVal );
				break;

			case 'blur':
				createdProp = self.prototype.createKeyframesPropFilterBlur( pattern.name, patternVal );
				break;

			case 'hue':
				createdProp = self.prototype.createKeyframesPropFilterHue( 'hue-rotate', patternVal );
				break;

			case 'invert':
				createdProp = self.prototype.createKeyframesPropFilterInvert( pattern.name, patternVal );
				break;

			default:
				break;

			}

			return createdProp;
		},

		/**
		 * 直線運動のスタイルを作成する
		 * @param  {string} funcName   CSStransformの関数名
		 * @param  {string} propVal    関数に指定する値
		 * @param  {object} misc       その他の設定オブジェクト
		 * @return {string} retFuncStr 作成した関数の文字列
		 */
		createKeyframesPropLinear: function ( funcName, propVal, misc ) {
			var retFuncStr = '',
			    rev;

			if ( 'number' === typeof misc.origin ) {
				switch ( misc.origin ) {
				case 0: // 左上
					rev = self.prototype.addStr( -propVal, 'px' );
					retFuncStr = funcName + '(0px, ' + rev + ')' + funcName + '(' + rev + ', 0px)';
					break;

				case 1: // 上
					rev = self.prototype.addStr( -propVal, 'px' );
					retFuncStr = funcName + '(0px, ' + rev + ')';
					break;

				case 2: // 右上
					rev     = self.prototype.addStr( -propVal, 'px' );
					propVal = self.prototype.addStr( propVal, 'px' );
					retFuncStr = funcName + '(0px, ' + rev + ')' + funcName + '(' + propVal + ', 0px)';
					break;

				case 3: // 左
					rev     = self.prototype.addStr( -propVal, 'px' );
					retFuncStr = funcName + '(' + rev + ', 0px)';
					break;

				case 4: // 中央
					break;

				case 5: // 右
					propVal = self.prototype.addStr( propVal, 'px' );
					retFuncStr = funcName + '(' + propVal + ', 0px)';
					break;

				case 6: // 左下
					rev     = self.prototype.addStr( -propVal, 'px' );
					propVal = self.prototype.addStr( propVal, 'px' );
					retFuncStr = funcName + '(0px, ' + propVal + ')' + funcName + '(' + rev + ', 0px)';
					break;

				case 7: // 下
					propVal = self.prototype.addStr( propVal, 'px' );
					retFuncStr = funcName + '(0px, ' + propVal + ')';
					break;

				case 8: // 右下
					propVal = self.prototype.addStr( propVal, 'px' );
					retFuncStr = funcName + '(0px, ' + propVal + ')' + funcName + '(' + propVal + ', 0px)';
					break;
				}
			}

			return retFuncStr;
		},

		/**
		 *
		 * @param  {} funcName
		 * @param  {} prefix
		 * @return {}
		 */
		createKeyframesPropArc: function ( funcName, propVal ) {
			var func   = '',
			    propVal  = self.prototype.addStr( propVal, 'deg' )

			func = '(' + propVal + ')';

			return funcName + func;
		},

		/**
		 *
		 * @param  {} funcName
		 * @param  {} propVal
		 * @return {}
		 */
		createKeyframesPropScale: function ( funcName, propVal ) {
			// TODO: context
			var pt = '0',
			    func   = '';

			if ( '0' === pt ) {
				func = '(' + propVal + ')';
			}
			else if ( '1' === pt ) {
				func = '(' + propVal + ', 1)';
			}
			else if ( '2' === pt ) {
				func = '(1,' + propVal + ')';
			}

			return funcName + func;
		},

		createKeyframesPropFilterOpacity: function ( funcName, propVal ) {
			var propVal = self.prototype.addStr( propVal, '%' );
			return self.prototype.createKeyframesPropFilter( funcName, propVal );
		},

		createKeyframesPropFilterBlur: function ( funcName, propVal ) {
			var propVal = self.prototype.addStr( propVal, 'px' );
			return self.prototype.createKeyframesPropFilter( funcName, propVal );
		},

		createKeyframesPropFilterHue: function ( funcName, propVal ) {
			var propVal = self.prototype.addStr( propVal, 'deg' );
			return self.prototype.createKeyframesPropFilter( funcName, propVal );
		},

		createKeyframesPropFilterInvert: function ( funcName, propVal ) {
			var propVal = self.prototype.addStr( propVal, '%' );
			return self.prototype.createKeyframesPropFilter( funcName, propVal );
		},

		createKeyframesPropFilter: function ( funcName, propVal ) {
			return funcName + '(' + propVal + ')';
		}
	}

	return self;
}() );
