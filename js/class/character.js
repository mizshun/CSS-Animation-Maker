/**
 * @fileoverview キャラクターのオブジェクトを管理する
 */

// 名前空間
var animMaker = animMaker || {};

/**
 * キャラクターのオブジェクトを管理する
 * @constructor
 * @classdesc
 * @param {object} f ファイルオブジェクト
 * @param {string} partsId 追加されるキャラクターパーツのid名
 * @param {string} originId 選択されたインプット要素のid名
 */
animMaker.Character = ( function () {
	'use strict';

	/* ------------------------------
	 定数
	 ------------------------------*/
	var CLASS_ACTIVE = 'active';

	// パーツ (本体)のポジション初期値
	var PARTS_MAIN_INTIAL_POS = {
		bottom    : 0,
		left      : '50%',
		marginLeft: 0
	};

	/* ------------------------------
	 HTMLテンプレート
	 ------------------------------*/
	// 各パーツ
	var TEMPLATE_CHARACTER_PARTS = [
		'<div>',
			'<img>',
		'</div>'
	].join( '' );

	/* 一時保管用 */
	var characterInstance = [];

	/* コンストラクタ */
	var self = function Character( data ) {
		/* ------------------------------
		 メンバ
		 ------------------------------*/
		/**
		 * パーツデータ
		 */
		this.data = $.extend( {},
			{
				/**
				 * 要素のID名
				 * @type {string}
				 */
				id    : '',
				/**
				 * 選択された結果のファイルオブジェクト
				 * @type {object}
				 */
				file  : {},
				/**
				 *  DATA URI
				 * @type {string}
				 */
				dataURI: '',
				/**
				 * 画像の幅
				 * @type {number}
				 */
				width : 0,
				/**
				 * 画像の高さ
				 * @type {number}
				 */
				height: 0,
				/**
				 * 重なりの順列
				 * @type {number}
				 */
				zIndex: 0,
				/**
				 * パーツに付与されたスタイル
				 * @type {object}
				 */
				css   : {
					/*
					 * 位置
					 */
					pos: {
					},
					/*
					 * アニメーション
					 */
					anim: []
				}
			}
			, data
		);

		/* ------------------------------
		 DOMアクセス
		 ------------------------------*/
		this.dom = {};
		/**
		 * 設定するキャラクターのトップ要素
		 * @type {jQueryObject}
		 */
		this.dom.$compEnemy    = $( '#comp-enemy' );
		/**
		 * キャラクターパーツ画像を包含するパーツのトップ要素
		 * @type {jQueryObject}
		 */
		this.dom.$imgPartsWrap = $( TEMPLATE_CHARACTER_PARTS ).addClass( animMaker.main.data.PARTS_ID );
		/**
		 * キャラクターパーツ画像
		 * @type {jQueryObject}
		 */
		this.dom.$imgParts     = this.dom.$imgPartsWrap.find( 'img' );

		this.init();
	}

	/* パブリックメソッド */
	self.prototype = {
		/**
		 * 初期化する
		 */
		init: function () {
			console.info( 'Class: Character.init()' );

			// IDを変換
			this.data.id = this.convertId( this.data.id, animMaker.main.data.UPLOAD_ID, animMaker.main.data.PARTS_ID ),

			/* ------------------------------
			 イベント
			 ------------------------------*/
			this.dom.$imgParts
				// 画像ファイルオブジェクト読み込みしたとき
				.on( animMaker.ns + 'FileLoaded',    this.ctlFileLoaded )

				// 画像読み込み完了したとき
				.on( 'load',                         this.ctlImgLoad )

				// 画像ファイル読み込み完了したとき
				.on( animMaker.ns + 'ImgLoaded',     this.ctlImgLoaded );

			this.dom.$imgPartsWrap
				// パーツをクリックしたとき
				.on( 'mousedown',                    $.proxy( this.ctlSelectedParts, this ) )
				// パーツをダブルクリックしたとき

				.on( 'dblclick',                     $.proxy( this.ctlDblClick, this ) )
				// パーツが移動され停止したとき

				.on( 'dragstop',                     $.proxy( this.ctlDragedParts, this )  )
				// 選択ボタンがクリックされたとき

				.on( 'changeCurrentActive',          this.ctlChangeCurrentActive )
				// 操作エリアが押されたとき

				.on( animMaker.ns + 'AreaMouseDown', this.renderDeleteActive )

				//
				.on( animMaker.ns + 'DeleteParts',   this.ctlDeleteParts );
		},

		/* ------------------------------
		 コントローラー
		 ------------------------------*/
		//
		ctlDragedParts: function ( e, ui ) {
			// console.log( e, ui );
			var cc           = animMaker.main.characterCollection,
			    currentParts = cc.getCurrentCollectionData( e.target.id ),
			    that         = this;

			$.each( ui.position, function ( propName, val ) {
				that.setStyle( propName, val, 'pos' );
			} );
		},

		// 画像ファイルオブジェクト読み込みしたとき
		ctlFileLoaded: function ( e, readerEvent, character, uploadId ) {
			self.prototype.fileLoaded( e, readerEvent, character, uploadId );
		},

		// 画像ファイル読み込み完了したとき
		ctlImgLoad: function ( e, readerEvent, character ) {
			self.prototype.imgLoad( e, readerEvent, character );
		},

		// 画像ファイル読み込み完了したとき
		ctlImgLoaded: function ( e, character ) {
			self.prototype.render( e, character );
		},

		// パーツをクリックしたとき
		ctlSelectedParts: function ( e ) {
			e.stopPropagation();
			e.preventDefault();

			// 選択ボタンのIDに変換する
			var mn       = animMaker.main,
			   currentId = self.prototype.convertId( e.currentTarget.id, mn.data.PARTS_ID, mn.data.SELECT_ID );

			// 選択されたパーツに対応した選択ボタンに通知する
			$( '#' + currentId ).trigger( 'click' );
		},

		// 選択ボタンがクリックされたとき
		ctlChangeCurrentActive: function ( e ) {
			self.prototype.renderCurrentActive( e );
		},

		/**
		 * パーツをダブルクリックしたとき
		 * @param  {object} e イベントオブジェクト
		 */
		ctlDblClick: function ( e ) {
			var currentId = e.currentTarget.id,
			    currentData,
			    collection,
			    $areaControlPanel;

			// 現在のパーツのデータを取得する
			currentData = animMaker.main.characterCollection.getCurrentCollectionData( currentId );
			// パーツの重なり順を管理、変更する
			collection = self.prototype.managePartsOrder( currentData );

			$.each( collection, function ( i, v ) {
				animMaker.main.setCssStyles( { zIndex: v.data.zIndex }, v.dom.$imgPartsWrap );
			} );

			// 操作パネルに通知する
			$areaControlPanel = animMaker.main.controlPanel.dom.$areaControlPanel;
			$areaControlPanel.trigger( animMaker.ns + 'changeCurrentParts', [currentData, null] );
		},

		/**
		 * 該当パーツを削除する
		 * @param  {object} e イベントオブジェクト
		 */
		ctlDeleteParts: function ( e, currentData ) {
			e.stopPropagation();

			// パーツの重なり順を再構成する
			self.prototype.managePartsOrder( currentData );
			// パーツを削除する
			self.prototype.remove( $( e.target ) );
		},

		/* ------------------------------
		 ビュー
		 ------------------------------*/
		/**
		 * 描画
		 * @param  {dom} e イベントオブジェクト
		 * @param {object} character キャラクターパーツオブジェクト
		 */
		render: function ( e, character ) {
			// DOM
			var $areaEnemy    = animMaker.main.controlEnemy.dom.$areaEnemy,
			    $compEnemy    = character.dom.$compEnemy,
			    $imgPartsWrap = character.dom.$imgPartsWrap;

			// キャラクターパーツのHTMLを完成する
			$compEnemy.append( $imgPartsWrap );
			// キャラクターパーツ完成、操作エリアへ通知する
			$areaEnemy.trigger( animMaker.ns + 'partsComplete', [$compEnemy] );
		},

		/**
		 * 選択されている要素をハイライトする
		 * @param  {object} e イベントオブジェクト
		 */
		renderCurrentActive: function ( e ) {
			var currentActive = animMaker.main.fileSelect.data.currentActive;

			// 全削除
			self.prototype.renderDeleteActive( e );
			// クラス付与
			if ( currentActive ) {
				$( e.target ).addClass( CLASS_ACTIVE );
			}
		},

		/**
		 * 要素のハイライトを削除する
		 * @param  {object} e イベントオブジェクト
		 */
		renderDeleteActive: function ( e ) {
			$( e.target ).add( $( e.target ).siblings() ).each( function ( i, v ) {
				$( v ).removeClass( CLASS_ACTIVE );
			} );
		},

		/* ------------------------------
		 モデル
		 ------------------------------*/
		/**
		 * SETTER
		 * @param {string} propName プロパティ名
		 * @param {mix} val セットする値
		 * return {object|boolean} this.data or false 成功時：セット後のキャラクターデータオブジェクト
		 *     失敗時：false
		 */
		set: function ( propName, val ) {
// console.info( '%ccharacter.set(propName, val): ', 'color:#2476c9;', propName, val );
			if ( 'undefined' !== typeof this.data[ propName ] ) {
				this.data[ propName ] = val;
				return this.data;
			}
			return false;
		},

		/**
		 * CSSスタイルをセットする
		 * @param {string} propName プロパティ名
		 * @param {mix} val セットする値
		 * @param {string} context セットする値の種類
		 * @param {number} index アニメーションのインデックス番号
		 *     ※アニメーションのみ使用
		 */
		setStyle: function ( propName, val, context, index ) {
			var styles;

			switch ( context ) {
			case '':
			case null:
			case undefined:
			case false:
				styles = this.getAnim();
				styles[index][propName] = val;
				break;

			case 'detail':
			case 'keyframes':
			case 'misc':
				styles = this.getAnim();
				styles[index][context][propName] = val;
				break;

			case 'pos':
				styles = this.getPos();
				styles[propName] = val;
				break;
			}
		},

		/**
		 * 要素へ属性をセットする
		 * @param {object} character 情報を追加したキャラクターパーツオブジェクト
		 * @param {jQueryObject} $imgParts 画像要素オブジェクト
		 * @param {jQueryObject} $imgPartsWrap 画像を含んだキャラクター要素オブジェクト
		 */
		setAttributes: function ( character, $imgParts, $imgPartsWrap ) {
			// 属性を設定する
			$imgParts
				.attr( 'alt',   character.data.file.name )
				.attr( 'title', character.data.file.name );
			$imgPartsWrap
				.attr( 'id',    character.data.id );
		},

		/**
		 * dataオブジェクトに情報を追加する
		 * @param {object} $imgParts imgオブジェクト
		 * @param {object} character dataオブジェクト
		 */
		setPartsDimentionProps: function ( character, imgParts ) {
			var length = animMaker.main.characterCollection.length();
			// プロパティーセット
			character.set( 'width',  imgParts.width );
			character.set( 'height', imgParts.height );
			character.set( 'zIndex', ++length );
		},

		/**
		 * アニメーションパターンをデータに追加する
		 * @param {object} animPatterns 追加するアニメーションパターン
		 * return {object} anims アニメーションパターン配列
		 */
		setAnimItems: function ( animPatterns ) {
			if ( Object.prototype.toString.call( animPatterns ) !== '[object Array]' ) { return false; }

			var anims = this.getAnim();

			$.each( animPatterns, function ( i, animPattern ) {
				anims.push( animPattern );
			} );
			return anims;
		},

		/**
		 * GETTER
		 * @param {string} propName プロパティ名
		 * return {mix}             プロパティの値
		 */
		get: function ( propName ) {
			if ( 'undefined' !== typeof this.data[ propName ] ) {
				return this.data[ propName ];
			}
			return '';
		},

		/**
		 * 現在のアニメーションパターンを取得する
		 * @param  {number} index 取得するアニメーションパターンのインデックス
		 * @return {array|object} アニメーションパターン配列、
		 *     または単独のアニメーションパターン
		 */
		getAnim: function ( index ) {
			if ( Object.prototype.toString.call( index ) === '[object Number]' ) {
				return this.data.css.anim[index] ? this.data.css.anim[index] : false;
			} else {
				return this.data.css.anim;
			}
		},

		getPos: function () {
			return this.data.css.pos;
		},

		/**
		 * 現在のアニメーションパターンの数を取得する
		 * @return {number} 現在のアニメーションパターンの数
		 */
		getAnimLength: function () {
			return this.data.css.anim.length;
		},

		/**
		 * アニメーションパターンを削除する
		 * @param  {number} deleteIndex 削除する要素のID
		 */
		deleteAnim: function ( deleteIndex ) {
			var anims        = [],
			    $manageAnims = animMaker.main.manageAnim.dom.$manageAnims;

			this.data.css.anim = $.grep( this.data.css.anim, function ( anim, index ) {
				return deleteIndex === index;
			}, true );

			// 再描画のため通知する
			$manageAnims.trigger( animMaker.ns + 'updatePanel', [this, true] );
		},

		/**
		 * パーツを削除する
		 * @param  {jQueryObject} $removeParts 削除する要素
		 */
		remove: function ( $removeParts ) {
			$removeParts.remove();
		},

		/**
		 * ファイル情報読み込み後の処理
		 * @param {object} e イベントオブジェクト
		 * @param {object} readerEvent ファイルリーダーのイベントオブジェクト
		 * @param {object} character キャラクターオブジェクト (インスタンス)
		 */
		fileLoaded: function ( e, readerEvent, character, uploadId ) {
			// 一時保管
			var index = $( e.target ).data( 'index' ) || 0;

			characterInstance[index]              = character;
			characterInstance[index].data.dataURI = readerEvent.target.result;

			// 画像読み込み $( e.target ) ==  $( img )
			$( e.target )
				.attr( 'src', characterInstance[index].data.dataURI );

			if ( uploadId ) {
				// アップロードボタンに通知する
				$( '#' + uploadId ).trigger( animMaker.ns + 'FileLoaded', [character.get( 'file' )] );
			}
		},

		/**
		 * 画像ロード後の処理
		 * @param {object} e イベントオブジェクト
		 * @param {object} character キャラクターオブジェクト (インスタンス)
		 */
		imgLoad: function ( e ) {
			var index, character;

			var $imgParts     = $( e.target ),
			    $imgPartsWrap = $imgParts.parent();

			// 一時保管していたキャラクターインスタンス
			index     = $imgParts.data( 'index' ) || 0;
			character = characterInstance[index];
			$imgParts.removeData( 'index' );


			// 新規作成時のみ処理する
			// ( width, height, marginLeft )
			if ( character.data.newParts ) {
				// キャラクターパーツプロパティーを追加する
				self.prototype.setPartsDimentionProps( character, e.target );
				delete character.data.newParts;
			}

			// コレクションに通知する
			animMaker.main.characterCollection.dom.$body.trigger( animMaker.ns + 'AddParts', [character] );

			// キャラクターパーツ要素に属性を追加する
			self.prototype.setAttributes( character, $imgParts, $imgPartsWrap );
			// パーツに応じてドラッグイベントを設定したりする
			self.prototype.setParts( character, $imgPartsWrap );
			// 重なり順を適用する
			animMaker.main.setCssStyles( { zIndex: character.data.zIndex }, $imgPartsWrap );

			// ビューへ通知
			$imgParts.trigger( animMaker.ns + 'ImgLoaded', [character] );
		},

		/**
		 * パーツの重なり順を管理、変更する
		 * @param  {object} currentData 現在のパーツオブジェクト
		 */
		managePartsOrder: function ( currentData ) {
			var collection  = animMaker.main.characterCollection.datas,
			    originIndex = currentData.data.zIndex;

			$.each( collection, function ( i, v ) {
				if ( v.data.zIndex === originIndex ) {
					v.data.zIndex = collection.length;
				} else if ( v.data.zIndex > originIndex ) {
					v.data.zIndex--;
				}
			} );
			return collection;
		},

		/**
		 * 本体・サブパーツで処理を分岐する
		 * @param {object} character キャラクターデータオブジェクト
		 * @param {object} $imgPartsWrap 画像を包含するオブジェクト
		 */
		setParts: function ( character, $imgPartsWrap ) {
			switch( -1 === character.data.id.indexOf( 'main' ) ) {
			case true: // パーツ
				self.prototype.setSubParts( character, $imgPartsWrap );
				break;
			default: // 本体
				self.prototype.setMainParts( character, $imgPartsWrap );
				break;
			}
		},

		/**
		 * キャラクターパーツ要素 (本体)を設定する
		 * @param {object} character キャラクターデータオブジェクト
		 * @param {jQueryObject} $imgPartsWrap 画像を包含するオブジェクト
		 */
		setMainParts: function ( character, $imgPartsWrap ) {
			// 初期値をセットする
			character.data.css.pos = $.extend( true, {}, PARTS_MAIN_INTIAL_POS );
			// キャラクターを中央揃えするためのネガティブマージン
			self.prototype.setCenteredParts( character );
			// スタイルを適用する
			animMaker.main.setCssStyles( character.data.css.pos, $imgPartsWrap );
		},

		/**
		 * キャラクターパーツ要素 (パーツ)を設定する
		 * @param {jQueryObject} $imgPartsWrap 画像を包含するオブジェクト
		 */
		setSubParts: function ( character, $imgPartsWrap ) {
			// 要素をドラッグできるようにする
			self.prototype.setDraggable( $imgPartsWrap );

			/* TODO: アニメーション設定処理 */
			// スタイルを適用する
			animMaker.main.setCssStyles( character.data.css.pos, $imgPartsWrap );
		},

		/**
		 * 中央揃えするためのデータをセットする (本体用)
		 * @param {object} character キャラクターパーツオブジェクト
		 */
		setCenteredParts: function ( character ) {
			var pos = character.getPos();

			// キャラクターを中央揃えするためのネガティブマージン
			pos['marginLeft'] = -( Math.floor( character.data.width / 2 ) );
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
		},

		/**
		 * 要素をドラッグできるようにする
		 * @param {jQueryObject} $imgPartsWrap 画像を包含するオブジェクト
		 */
		setDraggable: function ( $imgPartsWrap ) {
			var $areaEnemy =  animMaker.main.controlEnemy.dom.$areaEnemy;
			// Use jQueryUI Draggable
			$imgPartsWrap
				.draggable( {
					containment: $areaEnemy,
					// zIndex: 9999,
				} );
		}
	}

	return self;
}() );
