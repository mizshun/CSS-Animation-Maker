/**
 * This is simple library for javascript
 * (jQuery依存有り)
 *
 * @author Shunsuke Mizusawa
 * @version 0.1.0
 *
 * @todo jQuery依存解消
 */
Util = (function( w, d, $ ) {
	'use strict';


	/*
	 * 依存関係
	 */
	// None


	/*
	 * PRIVATE
	 */
	var b = d.getElementsByTagName( 'body' )[0]; // Body


	/*
	 * GENERAL SETTING
	 */
	// フォールバック IE8以下
	if ( ! Object.create ) {
		Object.create = function ( o ) {
			function Inherit() {}
			Inherit.prototype = o;
			return new Inherit();
		};
	}


	// フォールバック IE8以下
	if ( ! Array.isArray ) {
		Array.isArray = function( obj ) {
			return Object.prototype.toString.call( obj ) === '[object Array]';
		};
	}


	// フォールバック IE8以下
	if ( ! Array.prototype.indexOf ) {
		Array.prototype.indexOf = function ( needle ) {
			var i = 0, l = this.length;

			for ( ; i < l; i++ ) {
				if ( this[i] === needle ) {
					return 0;
				}
			}

			return -1;
		};
	}


	// 拡張
	// if ( ! Array.prototype.inArray ) {
		Array.prototype.inArray = function ( needle ) {
			return ( 0 > this.indexOf( needle ) ) ? false : true;
		};
	// }


	// 拡張
	// if ( ! Array.prototype.shuffle ) {
		Array.prototype.shuffle = function () {
			var i = this.length;

			while( i ) {
				var j = Math.floor( Math.random() * i );
				var t = this[--i];
				this[i] = this[j];
				this[j] = t;
			}

			return this;
		};
	// }
	//

	// 拡張
	// if ( ! Array.prototype.clear ) {
		Array.prototype.clear = function () {
			this.length = 0;
			return this;
		};
	// }


	/*
	 * PUBLIC API
	 */
	return {


		/**
		 * 名前空間を定義します
		 *
		 * @param  {String} nsStr 名前空間として使用する文字列
		 * @return {Obejct}        文字列から作られた名前空間をもつオブジェクト
		 *
		 * @example
		 * Util.ns('Util.Event.addListener');
		 * UtilのEventにaddListenerを追加します
		 */
		ns: function ( nsStr ) {
			var parts  = nsStr.split( '.' ),
			    root   = w[parts.shift( 0 )],
			    i      = 0,
			    max    = parts.length;

			for ( ; i < max; i += 1 ) {
				if ( typeof root[parts[i]] === 'undefined' ) {
					// 名前空間を定義
					root[parts[i]] = {};
				}

				// 再代入
				root = root[parts[i]];
			}

			return root;
		},


		/**
		* 2つの値を比較して真偽値で結果を返します。（デバッグ用）
		*
		* @param  {String}  message       比較結果に添えるメッセージ文
		* @param  {Mix}     diff1         比較値
		* @param  {Mix}     diff2         比較値
		* @param  {Boolean} disableStrict 型変換する
		* @return {Mix}     console.log   比較結果
		*
		* @example
		* var hoge = 0;
		* Util.assert( 'hoge === false', hoge, false ); // false
		*
		* var fuga = 0;
		* Util.assert( 'fuga == false', fuga, true ); // true
		*/
		assert: function ( message, diff1, diff2, disableStrict ) {
			var ret,
			    msg = message ? message + ' : ' : '';

			if ( 'boolean' === typeof disableStrict && disableStrict ) {
				ret = ( diff1 == diff2 );
			} else {
				ret = ( diff1 === diff2 );
			}

			return console.info( msg, ret );
		},


		/**
		* 配列風オブジェクトを配列に変換します
		*
		* @param  {Object} arguments 変換する配列風オブジェクト
		* @return {Array}            変換した配列
		*
		* @example
		* var els = document.getElementsByTagName( 'li' );
		* els     = Util.convertToArray( els );
		*/
		convertToArray: function ( /* arguments */ ) {
			return [].slice.apply( arguments );
		},


		/**
		* オブジェクトの型をチェックする
		*
		* @param  {Object} obj チェックするオブジェクト
		* @return {String}     チェック結果の文字列
		*/
		checkObjType: function ( obj ) {
			return Object.prototype.toString.call( obj );
		},


		/**
		* 必要なとき動的にスクリプトを読みこみます
		*
		* @param  {String}   file ファイルのパス
		* @param  {Function} cb   スクリプト読み込み後に実行する関数
		* @return {Boolean}  N/A
		*
		* @example
		* Util.onDemandScript( 'js/hoge.js', onDemandAfterFunc );
		* hoge.jsを読み込み、その後に関数onDemandAfterを実行します。
		*/
		onDemandScript: function ( file, cb ) {
			var elScript = d.createElement( 'script' );

			// Callbackが関数かチェックする
			if ( typeof cb !== 'function' ) {
				cb = false;
			}

			/* コールバック */
			// IE
			elScript.onstatechange = function () {
				if ( elScript.readyState === 'loaded' || elScript.readyState ===  'complete' ) {
					elScript.onstatechange = null;
					if ( cb ) {
						cb();
					}
				}
			};

			// IE以外
			elScript.onload = function () {
				if ( cb ) {
					cb();
				}
			};

			// ファイル読み込み
			elScript.src = file;
			b.appendChild( elScript );
		},


		/**
		 * 間引き（実行回数）を減らして関数を実行する
		 *
		 * @param  {Number}   times   何回毎に実行するか
		 * @param  {Function} handle  実行する関数
		 * @return {Function} wrapper 関数の実行回数を調整する関数（処理）
		 */
		createThrottleHandler: function ( times, handle ) {
			var calledCount = 0;

			function wrapper() {
				if ( ++calledCount % times === 0 ) {
					handle.apply( this, arguments );
					calledCount = 0;
				}
			}
			return wrapper;
		},

		/**
		 * 要素の画面（または指定した要素）上部までの距離を数値で取得します。
		 * (jQuery依存)
		 *
		 * @param  {String}  target    数値を取得する要素名
		 * @param  {String}  [context] 距離を取得する基準となる要素名
		 * @param  {Boolean} [contain] 要素自身の高さを含むか
		 *
		 * @return {Number or undefined} distance 要素の画面上部までの距離
		 */
		untilScreenTop: function( target, context, contain ) {
			var $target = $( target ),
			    $context,
			    distance,
			    context      = d, // Document
			    targetHeight = 0;

			// 要素確認
			if ( ! $target.length ) { return undefined; }

			// 第二引数があれば、基準になる要素を再設定する
			if ( 'undefined' !== typeof context || ! context ) { context = context; }

			// 第三引数があれば、距離を測る基準になる位置(要素の上下)を再設定する
			if ( 'undefined' !== typeof contain || true === contain ) { targetHeight = $target.outerHeight(); }

			// 要素取得
			$context = $( context );

			// 要素確認
			if ( ! $context.length ) { return undefined; }

			// 距離取得
			distance = parseInt( ( $target.offset().top + targetHeight ) - ( $context.scrollTop() ), 10 );

			return distance;
		},


		/**
		 * 要素が画面（または指定した要素）上部に達しているかチェックします。
		 * (jQuery依存)
		 *
		 * @param  {String}  target    数値を取得する要素名
		 * @param  {String}  [context] 距離を取得する基準となる要素名
		 * @param  {Boolean} [contain] 要素自身の高さを含むか
		 *
		 * @return {Boolean or Undefined} 要素の画面上部までの達しているかの真偽値
		 */
		checkScreenTop: function ( target, context, contain ) {
			var pos = this.untilScreenTop( target, context, contain );

			if ( ( 'undefined' === typeof pos ) ) { return undefined; }

			return  0 >= pos;
		},


		/**
		 * 指定した要素が画面内にあるかの判定による分岐処理を登録します
		 * (jQuery依存)
		 *
		 * @param {String}   target    判定する要素名
		 * @param {Function} [inFunc]  要素が画面内にある時の処理
		 * @param {Function} [outFunc] 要素が画面内にない時の処理
		 * @param {Mix}      [inArgs]  要素が画面内にある時の処理へのオプション
		 * @param {Mix}      [outArgs] 要素が画面内にない時の処理へのオプション
		 *
		 * @return {Boolean} isIntoScren 指定した要素が画面内にあるかの真偽値
		 */
		innerScreen: function ( target, inFunc, outFunc, inArgs, outArgs ) {
			$( window ).on( 'load scroll', function() {
				var clientHeight = window.innerHeight      || document.documentElement.clientHeight;
				var scrollTop    = document.body.scrollTop || document.documentElement.scrollTop;

				var from         = scrollTop + clientHeight; // 画面下部
				var to           = scrollTop;                // 画面上部

				// 範囲内の場合に適用する関数があるか
				if ( 'function' !== typeof inFunc )  { inFunc  = false; }
				if ( 'function' !== typeof outFunc ) { outFunc = false; }

				// 適用
				$( target ).each( function() {
					var $self             = $( this );
					var offsetTop         = $self.offset().top;              // 要素上部
					var offsetTopAsBottom = offsetTop + $self.outerHeight(); // 要素下部
					var isIntoScren       = offsetTop < from && offsetTopAsBottom > to;

					if ( isIntoScren ) {
						// 範囲内の場合に適用する関数
						if ( inFunc ) { inFunc( inArgs ); }
					} else {
						// 範囲外の場合に適用する関数
						if ( outFunc ) { outFunc( outArgs ); }
					}

					return isIntoScren;
				} );
			} );
		},


		/**
		 * @class ImageLoader
		 */
		ImageLoader: function () {
			this.loaded = [];

			/**
			 * 画像をプリロードします。
			 *
			 * @param {String} url 読み込む画像のパス
			 *
			 * @return {Undefined or Boolean}
			 */
			Util.ImageLoader.prototype.addPreLoad = function ( url ) {
				var cacheImg;

				// 読み込み済みなら読み込みしない
				if ( this.loaded.length && this.loaded.inArray( url ) ) { return false; }

				// 読み込み済みリスト
				this.loaded.push( url );

				cacheImg     = new Image();
				cacheImg.src = url;

				// 読み込み完了
				cacheImg.onload = function ( e ) {
					// 処理
				}

				cacheImg.onerror = function ( e ) {
					// 処理
				}
			}
		},



		/**
		 * キーイベントを取得する
		 *  (jQuery依存)
		 *
		 * @object
		 */
		keyBind: {
			/**
			 * キーコードを取得する
			 *  (jQuery依存)
			 *
			 * @param {Object} e キーイベントオブジェクト
			 *
			 * @return {Object}  キーコード、シフトキー、ALTキー、CTLキー
			 */
			getKeyCode: function ( e ) {
				return {
					code  : e.which,
					shift : e.shiftKey,
					alt   : e.altKey,
					ctl   : e.ctrlKey
				};
			},


			/**
			 * キーコードを文字列に変換する
			 *  (jQuery依存)
			 *
			 * @param {Object}  e         キーイベントオブジェクト
			 *
			 * @return {String} keyString 押されたキーの文字列
			 */
			convertKeyCodeToString: function ( e ) {
				var key       = Util.keyBind.getKeyCode( e ),
				    keyString = null;

				if ( e.type !== 'keydown' ) { return; }

				// [↑]
				if ( key.code === 38 ) { keyString = 'up'; }

				// [↓]
				if ( key.code === 40 ) { keyString = 'down'; }

				// [→]
				if ( key.code === 39 ) { keyString = 'right'; }

				// [←]
				if ( key.code === 37 ) { keyString = 'left'; }

				// [A]
				if ( key.code === 65 ) { keyString = 'a'; }

				// [C]
				if ( key.code === 67 ) { keyString = 'c'; }

				// [V]
				if ( key.code === 86 ) { keyString = 'v'; }

				// [Ctl+Anykey]
				if ( key.ctl ) {
					// [Ctl+C]
					if ( key.code === 67 ) { keyString = 'ctl_c'; }

					// [Ctl+V]
					if ( key.code === 86 ) { keyString = 'ctl_v'; }
				}

				return keyString;
			}
		}


	};

}( window, document, jQuery ));
