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
animMaker.MiscUpLoader = ( function () {
	'use strict';

	/* コンストラクタ */
	var self = function FileUpLoader() {
		/* ------------------------------
		 DOMアクセス
		 ------------------------------*/
		this.dom = {};
		/**
		 * @private {object} アップローダーエリア
		 */
		this.dom.$areaMiscUploader      = $( '#area-misc' );
		/**
		 * @private {object} アップローダーエリア (本体)
		 */
		this.dom.$areaMiscUploaderBg  = $( '#area-misc__bg' );

		// 初期化する
		this.init();
	}

	self.prototype = {
		/**
		 * 初期化する
		 */
		init: function () {
			console.info( 'Class: MiscUpLoader.init()' );

			/* ------------------------------
			 イベント
			 ------------------------------*/
			this.dom.$areaMiscUploader
				// ファイルが選択されたとき
				.on( 'change',                     'input', $.proxy( this.ctlOpenFile, this ) )

				.on( animMaker.ns + 'DeleteParts', 'input', this.ctlDeleteParts )

				.on( animMaker.ns + 'FileLoaded',  'input', this.ctlFileLoaded );
		},

		/* ------------------------------
		 コントローラー
		 ------------------------------*/
		ctlOpenFile: function ( e ) {
			e.stopPropagation();

			// ファイルを開く
			this.openFile( e );

			// アップロードボタンを使用不可にする
			self.prototype.changeUploadBtnState( $( e.target ), true );
		},

		ctlDeleteParts: function ( e ) {
			e.stopPropagation();

			// アップロードボタンを使用可にする
			self.prototype.changeUploadBtnState( $( e.target ), false );
		},

		ctlFileLoaded: function ( e, files ) {
			e.stopPropagation();

			// アップロードボタンを使用可にする
			self.prototype.changeUploadBtnState( $( e.target ), true, files.name );
		},

		/* ------------------------------
		 モデル
		 ------------------------------*/
		/**
		 * ファイルを開く
		 * @param {object} e イベントオブジェクト
		 */
		openFile: function ( e ) {
			e.stopPropagation();
			e.preventDefault();

			// FILELIST OBJECT
			var files = e.dataTransfer ? e.dataTransfer.files : e.target.files;

			// 読み込み開始
			for ( var i = 0, f; f = files[i]; i++ ) {
				 self.prototype.readFile( f, e.target.id );
			}
		},

		/**
		 * ファイルを読み込む
		 * @param {Number} f ファイルオブジェクト
		 * @param {Number} uploadId インプット(ファイル)要素のid名
		 */
		readFile: function ( f, uploadId ) {
			var data = {};

			if ( ! f | ! uploadId ) { return false; }

			// 画像以外は処理しない
			if ( ! f.type.match( 'image.*' ) ) {
				alert( 'Please select an image file!' );
				return;
			}

			// ファイルリーダー作成
			var reader    = new FileReader();

			// ファイル読み込み完了時
			reader.onload = function ( progressEv ) {
				// 操作エリアへ通知する
				animMaker.main.controlEnemy.dom.$areaEnemy.trigger( animMaker.ns + 'BgFileLoaded', [progressEv] );
			};

			// ファイルデータ読み込み
			reader.readAsDataURL( f );
		},

		/**
		 * アップロードボタンを使用不可にする
		 * @param  {jQueryObject} $target アップロードボタン要素
		 * @param  {boolean}      state   更新する状態
		 */
		changeUploadBtnState: function ( $target, state, fileName ) {
			// 使用可
			if ( ! state && ! fileName ) {
				// 選択ファイル名表示を削除する
				$target.get(0).value = '';
			}
			// 使用不可 (ファイル読み込み時)
			else if ( state && fileName ) {
				// 選択ファイル名を表示する
				// TODO: 設定方法調査中
			}

			// 活性状態を変更する
			$target
				.prop( 'disabled', state )
				.toggleClass( 'selected' );
		}
	}

	return self;
}() );

