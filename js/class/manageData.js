/**
 * @fileoverview 保存データを管理する
 */

// 名前空間
var animMaker = animMaker || {};

/**
 * 保存データを管理する
 * @constructor
 * @classdesc
 */
animMaker.ManageData = ( function () {
	'use strict';

	/* ------------------------------
	 定数
	 ------------------------------*/
	var // セーブ確認テキスト
	    CONFIRRM_SAVE_TEXT       = '本当にセーブしますか？',
	    // ロード確認テキスト
	    CONFIRRM_LOAD_TEXT       = '本当にロードしますか？',
	    // 全削除確認テキスト
	    CONFIRRM_ALL_DELETE_TEXT = '本当にパーツを全て削除しますか？',
	    // セーブ完了テキスト
	    SAVE_COMP_TEXT           = 'セーブしました。',
	    // セーブデータが無いときのテキスト
	    LOAD_NO_DATA_TEXT        = 'データがありません。';

	/* コンストラクタ */
	var self = function ManageData() {
		/* ------------------------------
		 メンバ
		 ------------------------------*/
		this.data = {
			/**
			 * ストレージ名
			 */
			partsDataPropName: animMaker.ns + 'PartsData'
		};

		/* ------------------------------
		 DOMアクセス
		 ------------------------------*/
		this.dom = {};
		/**
		 * BODY要素
		 * @type {jQueryObject}
		 */
		this.dom.$body        = animMaker.main.dom.$body;
		/**
		 * ロードボタン要素
		 * @type {jQueryObject}
		 */
		this.dom.$controlLoad      = $( '#area-control__load' );
		/**
		 * セーブボタン要素
		 * @type {jQueryObject}
		 */
		this.dom.$controlSave      = $( '#area-control__save' );
		/**
		 * 全削除ボタン要素
		 * @type {jQueryObject}
		 */
		this.dom.$controlAllDelete = $( '#area-control__all-delete' );

		this.init();
	}

	/* パブリックメソッド */
	self.prototype = {
		/**
		 * 初期化する
		 */
		init: function () {
			console.info( 'Class: ManageData.init()' );

			/* ------------------------------
			 イベント
			 ------------------------------*/
			this.dom.$controlLoad
				// ロードボタンがクリックされたとき
				.on( 'click', this.ctlLoadData );

			this.dom.$controlSave
				// セーブボタンがクリックされたとき
				.on( 'click', this.ctlSaveData );

			this.dom.$controlAllDelete
				// 全削除ボタンがクリックされたとき
				.on( 'click', this.ctlAllDelete );
		},

		/* ------------------------------
		 コントローラー
		 ------------------------------*/
		/**
		 * ロードボタンがクリックされたとき
		 * @param  {object} e イベントオブジェクト
		 */
		ctlLoadData: function ( e ) {
			self.prototype.mamageDataLoad();
		},

		/**
		 * セーブボタンがクリックされたとき
		 * @param  {object} e イベントオブジェクト
		 */
		ctlSaveData: function ( e ) {
			self.prototype.mamageDataSave();
		},

		/**
		 * 全削除ボタンがクリックされたとき
		 * @param  {object} e イベントオブジェクト
		 */
		ctlAllDelete: function ( e ) {
			self.prototype.mamageAllDelete();
		},

		/* ------------------------------
		 モデル
		 ------------------------------*/
		/**
		 * パーツデータを読み込む
		 * @param  {object} e イベントオブジェクト
		 */
		mamageDataLoad: function ( e ) {
			var loadedData,
			    cc    = animMaker.main.characterCollection,
			    datas = cc.get();

			if ( ! window.confirm( CONFIRRM_LOAD_TEXT ) ) {
				// TODO: デバッグ用
				console.info( 'managedata.mamageDataSave: %cロードキャンセル', format );
				return;
			}

			// セーブデータを取得する
			loadedData = self.prototype.loadData( animMaker.main.manageData.data.partsDataPropName );

			// 取得したデータを確認する
			if ( ! self.prototype.checkLoadData( loadedData ) ) {
				alert( LOAD_NO_DATA_TEXT );
			}

			// パーツインスタンスを作成する
			self.prototype.createPartsFromLoadData( loadedData );
		},

		/**
		 * パーツデータを保存する
		 * @param  {object} e イベントオブジェクト
		 */
		mamageDataSave: function ( e ) {
			var cc    = animMaker.main.characterCollection,
			    datas = cc.get();

			if ( ! window.confirm( CONFIRRM_SAVE_TEXT ) ) {
				// TODO: デバッグ用
				console.info( 'managedata.mamageDataSave: %cセーブキャンセル', format );
				return;
			}

			// 保存する
			if ( self.prototype.saveData( datas ) ) {
				alert( SAVE_COMP_TEXT );
			}

		},

		/**
		 * 全パーツデータを削除する(ストレージからも)
		 * @param  {object} e イベントオブジェクト
		 */
		mamageAllDelete: function ( e ) {
			var cc    = animMaker.main.characterCollection,
			    datas = cc.get();

			if ( ! window.confirm( CONFIRRM_ALL_DELETE_TEXT ) ) {
				// TODO: デバッグ用
				console.info( 'managedata.mamageAllDelete: %c全削除キャンセル', format );
				return;
			}

			// セーブデータを全削除する
			self.prototype.deleteAllData();

			if ( ! datas.length ) { return; }

			$.each( datas, function ( i, currentData ) {
				var currentPartsId  = currentData.get( 'id' ),
				    currentSelectId = currentData.convertId( currentData.get( 'id' ), animMaker.main.data.PARTS_ID, animMaker.main.data.SELECT_ID );

				// コレクションに通知する
				cc.dom.$body.trigger( animMaker.ns + 'DeleteParts', [currentSelectId, currentPartsId] );
				// ビューへ通知する
				animMaker.main.controlPanel.dom.$areaControlPanel.trigger( animMaker.ns + 'UpdatePanel', [null, null, animMaker.ns + 'AreaMouseDown'] );
			} );

		},

		/**
		 * セーブデータを全削除する
		 */
		deleteAllData: function () {
			window.localStorage.clear();
		},

		/**
		 * パーツの情報をセーブする
		 * @param  {array} datas パーツのデータコレクション
		 * @return {boolean} データがセーブできたか
		 */
		saveData: function ( datas ) {
			var saveData = {};

			if ( ! datas ) { return false; }

			// データを再構成
			saveData = $.map( datas, function ( v, i ) { return v.data; } );
			// JSONに変換する
			saveData = JSON.stringify( saveData );
			localStorage.setItem( animMaker.main.manageData.data.partsDataPropName, saveData );

			return true;
		},

		/**
		 * パーツの情報をロードする
		 * @param  {array} propName ローカルストレージのキー名
		 * @return {array|boolean} loadData パーツのデータコレクション
		 */
		loadData: function ( propName ) {
			var loadData = {};

			if ( 'undefined' === typeof localStorage[propName] || ! localStorage[propName] ) { return false; }

			// データを取得する
			loadData = localStorage.getItem( propName );
			// オブジェクトに変換する
			loadData = JSON.parse( loadData );

			return loadData;
		},

		/**
		 * ロードされたデータをチェックする
		 * @param  {array}   loadedData チェックするデータ
		 * @return {boolean} チェック結果
		 */
		checkLoadData: function ( loadedData ) {
			if (
				'[object Array]' === Object.prototype.toString.call( loadedData ) &&
				loadedData.length &&
				loadedData
			) {
				return true;
			}

			return false;
		},

		/**
		 * データからパーツオブジェクトを作成する
		 * @param  {array} loadedData パーツデータ
		 */
		createPartsFromLoadData: function ( loadedData ) {
			if ( ! loadedData ) { return; }

			if ( loadedData ) {
				$.each( loadedData, function ( i, partsData ) {
					    // パーツインスタンスを作成する
					var character         = new animMaker.Character( partsData ),
					   // 擬似的なイベントオブジェクトを作成する
					    pseudoReaderEvent = { target: { result: partsData.dataURI } };

var uploadId = character.convertId( character.get( 'id' ), animMaker.main.data.PARTS_ID, animMaker.main.data.UPLOAD_ID )

					// キャラクターオブジェクトへ通知する
					character.dom.$imgParts
						.data( 'index', i ) // 画像ロード時、一時保管するキャラクターインスタンスの特定のため使用する
						.trigger( animMaker.ns + 'FileLoaded', [pseudoReaderEvent, character, uploadId] );
				} );
			}
		},
	}

	return self;
}() );
