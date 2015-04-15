/**
 * @fileoverview キャラクターのオブジェクトを管理する
 */

// 名前空間
var animMaker = animMaker || {};

/**
 * キャラクターのオブジェクトを管理する
 * @constructor
 * @classdesc
 */
animMaker.CharacterCollection = ( function () {
	'use strict';

	/* ------------------------------
	 定数
	 ------------------------------*/
	var // 最大パーツ数 ( 本体パーツ + サブパーツ )
	    COLLECTION_MAX_LENGTH = 1 + 8;

	/* コンストラクタ */
	var self = function CharacterCollection() {
		/* ------------------------------
		 メンバ
		 ------------------------------*/
		this.datas = [];


		/* ------------------------------
		 DOMアクセス
		 ------------------------------*/
		this.dom = {};
		/**
		 * BODY要素
		 * @type {jQueryObject}
		 */
		this.dom.$body = animMaker.main.dom.$body;

		this.init();
	}

	self.prototype = {
		/**
		 * 初期化する
		 */
		init: function (){
			console.info( 'Class: CharacterCollection.init()' );

			/* ------------------------------
			 イベント
			 ------------------------------*/
			this.dom.$body
				// パーツがコレクションに追加されるとき
				.on( animMaker.ns + 'AddParts',     this.ctlAddParts )

				// パーツ削除ボタンが押されたとき
				.on( animMaker.ns + 'DeleteParts', this.ctlDeleteParts );
		},

		/* ------------------------------
		 コントローラー
		 ------------------------------*/
		/**
		 * コレクションにパーツオブジェクトが追加されたとき
		 * @param  {object} e        イベントオブジェクト
		 * @param {object} character パーツオブジェクト
		 */
		ctlAddParts: function ( e, character ) {
			e.stopPropagation();

			animMaker.main.characterCollection.set( character );

			// アニメーションスタイルに通知する
			animMaker.main.manageAnim.dom.$manageAnims.trigger( animMaker.ns + 'AddedParts', [character] );
		},

		/**
		 * パーツ削除ボタンが押されたとき
		 * @param  {object} e         イベントオブジェクト
		 * @param  {string} selectId  選択ボタンのID
		 * @param  {string} currentId パーツのID
		 */
		ctlDeleteParts: function ( e, selectId, currentId ) {
			e.stopPropagation();

			// 削除するパーツのデータ
			var currentData = self.prototype.getCurrentCollectionData( currentId ),
			    uploadId    = currentData.convertId( currentId, animMaker.main.data.PARTS_ID, animMaker.main.data.UPLOAD_ID );

			// パーツをコレクションから削除する
			animMaker.main.characterCollection.remove( currentId );

			// アップロードボタンに通知する
			$( '#' + uploadId ).trigger( animMaker.ns + 'DeleteParts' );
			// 選択ボタンに通知する
			$( '#' + selectId ).trigger( animMaker.ns + 'DeleteParts' );
			// パーツに通知する
			$( '#' + currentId ).trigger( animMaker.ns + 'DeleteParts', [currentData] );
			// アニメーションスタイルに通知する
			animMaker.main.manageAnim.dom.$manageAnims.trigger( animMaker.ns + 'DeleteParts', [currentData] );
			// 登録されているパーツが無くなったとき
			if ( ! animMaker.main.characterCollection.length() ) {
				// 操作エリアに通知する
				animMaker.main.controlEnemy.dom.$areaEnemy.trigger( animMaker.ns + 'partsRender' );
			}
		},

		/* ------------------------------
		 モデル
		 ------------------------------*/
		/**
		 * SETTER
		 * @param {object} data キャラクターオブジェクト
		 * return {object} 全オブジェクトの配列
		 */
		set: function ( data ) {
			if ( '[object Object]' !== Object.prototype.toString.call( data ) ) { return false; }

			// DOM
			var $areaControlSelect = animMaker.main.fileSelect.dom.$areaControlSelect;

			// コレクションにキャラクターデータを追加する
			this.datas.push( data );

			// console.info( 'characterCollection.set: ', animMaker );

			// パーツ選択エリアへ通知
			$areaControlSelect.trigger( animMaker.ns + 'setCharacterCollection', [this.datas] );

			return this.datas;
		},

		// setAll: function ( datas ) {
		// 	if ( '[object Array]' !== Object.prototype.toString.call( datas ) ) { return false; }

		// 	this.datas = datas;
		// 	return this.datas;
		// },

		/**
		 * GETTER
		 * return {object} 全オブジェクトの配列
		 */
		get: function () {
			return this.datas;
		},

		/**
		 * コレクションからパーツを削除する
		 * @param  {string} removeId 削除する要素のID
		 * @return {array}
		 */
		remove: function ( removeId ) {
			this.datas = $.grep( this.datas, function ( v, i ) {
				return removeId === v.data.id;
			}, true );
		},

		length: function () {
			return animMaker.main.characterCollection.datas.length;
		},

		getCurrentCollectionData: function ( currentId ) {
			var collection = animMaker.main.characterCollection.datas,
			    retData    = {};

			retData = $.grep( collection, function ( v, i ) {
				return v.data.id === currentId;
			} );

			return retData ? retData[0] : undefined;
		}
	}

	return self;
}() );
