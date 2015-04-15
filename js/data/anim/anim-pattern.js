
/**
 * @fileoverview アニメーションデータ
 *
 * ■関連メソッド (manageAnim内)
 * ・すべて
 * createKeyframesProp
 *
 * ・コンテキストのあるもののみ
 * createOperationLeft
 * updateContextValues
 * createStyleTfOrigin
 */

var
animMaker                   = animMaker                   || {};
animMaker.data              = animMaker.data              || {};
animMaker.data.animPatterns = animMaker.data.animPatterns || {};

/*
 * アニメーションパターン
 */
animMaker.data.animPatterns = {
	/*
	 * アニメーションパターン (上下移動)
	 */
	linear: {
		type  : 'transform',
		name  : 'linear',
		label : '直線運動',
		// 初期値
		initial: {
			animationDuration      : 1,
			animationFunction      : 'linear',
			animationDelay         : 0,
			animationIterationCount: 0,
			animationDirection     : 'alternate'
		},
		// 設定する値の入力要素のパーツ
		inputParts: [
			{
				type : 'number',
				name : '0',
				label: 'はじめ',
				attr : {
					placeholder: '整数指定',
					step       : 1,
					value      : 0
				}
			},
			{
				type : 'number',
				name : '100',
				label: 'おわり',
				attr : {
					placeholder: '整数指定',
					step       : 1,
					value      : 0
				}
			}
		],
		// 追加パーツ
		misc: {
			origin: 4
		},
		desc: '要素をアニメーションするときの方向を設定します'
	},

	/*
	 * アニメーションパターン (回転運動)
	 */
	arc: {
		type  : 'transform',
		name  : 'arc',
		label : '回転運動',
		// 初期値
		initial: {
			animationDuration      : 1,
			animationFunction      : 'linear',
			animationDelay         : 0,
			animationIterationCount: 0,
			animationDirection     : 'alternate'
		},
		// 設定する値の入力要素のパーツ
		inputParts: [
			{
				type : 'number',
				name : '0',
				label: 'はじめ',
				attr : {
					placeholder: '整数指定',
					step       : 1,
					value      : 0
				}
			},
			{
				type : 'number',
				name : '100',
				label: 'おわり',
				attr : {
					placeholder: '整数指定',
					step       : 1,
					value      : 0
				}
			}
		],
		// 追加パーツ
		misc: {
			origin: 4
		},
		desc: '要素をアニメーションするときの基準点を設定します'
	},

	/*
	 * アニメーションパターン (周回運動)
	 */
	// circle: {
	// 	type  : 'transform',
	// 	name  : 'circle',
	// 	label : '周回運動',
	// 	// 初期値
	// 	initial: {
	// 		animationDuration      : 1,
	// 		animationFunction      : 'linear',
	// 		animationDelay         : 0,
	// 		animationIterationCount: 0,
	// 		animationDirection     : 'alternate'
	// 	},
	// 	// 設定する値の入力要素のパーツ
	// 	inputParts: [
	// 		{
	// 			type : 'number',
	// 			name : '0',
	// 			label: 'はじめ',
	// 			attr : {
	// 				placeholder: '整数指定',
	// 				step       : 1,
	// 				value      : 0
	// 			}
	// 		},
	// 		{
	// 			type : 'number',
	// 			name : '100',
	// 			label: 'おわり',
	// 			attr : {
	// 				placeholder: '整数指定',
	// 				step       : 1,
	// 				value      : 0
	// 			}
	// 		}
	// 	],
	// 	// 追加パーツ
	// 	misc: {
	// 		origin: 4
	// 	},
	// },

	/*
	 * アニメーションパターン (拡大・縮小)
	 */
	scale: {
		type  : 'transform',
		name  : 'scale',
		label : '拡大・縮小',
		// 初期値
		initial: {
			animationDuration      : 1,
			animationFunction      : 'linear',
			animationDelay         : 0,
			animationIterationCount: 0,
			animationDirection     : 'alternate'
		},
		// 設定する値の入力要素のパーツ
		inputParts: [
			{
				type : 'number',
				name : '0',
				label: 'はじめ',
				attr : {
					placeholder: '整数指定',
					step       : 0.05,
					value      : 1
				}
			},
			{
				type : 'number',
				name : '100',
				label: 'おわり',
				attr : {
					placeholder: '整数指定',
					step       : 0.05,
					value      : 1.05
				}
			}
		],
		// 追加パーツ
		misc: {
			origin: 4
		},
		desc: '要素をアニメーションするときの基準点を設定します'
	},

	/*
	 * アニメーションパターン (透過)
	 */
	opacity: {
		type  : 'filter',
		name  : 'opacity',
		label : '透過',
		// 初期値
		initial: {
			animationDuration      : 1,
			animationFunction      : 'linear',
			animationDelay         : 0,
			animationIterationCount: 0,
			animationDirection     : 'alternate'
		},
		// 設定する値の入力要素のパーツ
		inputParts: [
			{
				type : 'number',
				name : '0',
				label: 'はじめ',
				attr : {
					placeholder: '整数指定',
					step       : 1,
					value      : 100,
					min        : 0,
					max        : 100
				}
			},
			{
				type : 'number',
				name : '100',
				label: 'おわり',
				attr : {
					placeholder: '整数指定',
					step       : 1,
					value      : 100,
					min        : 0,
					max        : 100
				}
			}
		],
		// 追加パーツ
		misc: {
		},
	},

	/*
	 * アニメーションパターン (ぼかし)
	 */
	blur: {
		type  : 'filter',
		name  : 'blur',
		label : 'ぼかし',
		// 初期値
		initial: {
			animationDuration      : 1,
			animationFunction      : 'linear',
			animationDelay         : 0,
			animationIterationCount: 0,
			animationDirection     : 'alternate'
		},
		// 設定する値の入力要素のパーツ
		inputParts: [
			{
				type : 'number',
				name : '0',
				label: 'はじめ',
				attr : {
					placeholder: '整数指定',
					step       : 1,
					value      : 0,
					min        : 0
				}
			},
			{
				type : 'number',
				name : '100',
				label: 'おわり',
				attr : {
					placeholder: '整数指定',
					step       : 1,
					value      : 0,
					min        : 0
				}
			}
		],
		// 追加パーツ
		misc: {
		},
	},

	/*
	 * アニメーションパターン (色相変化)
	 */
	hue: {
		type  : 'filter',
		name  : 'hue',
		label : '色相変化',
		// 初期値
		initial: {
			animationDuration      : 1,
			animationFunction      : 'linear',
			animationDelay         : 0,
			animationIterationCount: 0,
			animationDirection     : 'alternate'
		},
		// 設定する値の入力要素のパーツ
		inputParts: [
			{
				type : 'number',
				name : '0',
				label: 'はじめ',
				attr : {
					placeholder: '整数指定',
					step       : 1,
					value      : 0
				}
			},
			{
				type : 'number',
				name : '100',
				label: 'おわり',
				attr : {
					placeholder: '整数指定',
					step       : 1,
					value      : 0
				}
			}
		],
		// 追加パーツ
		misc: {
		},
	},

	/*
	 * アニメーションパターン (反転)
	 */
	invert: {
		type  : 'filter',
		name  : 'invert',
		label : '反転',
		// 初期値
		initial: {
			animationDuration      : 1,
			animationFunction      : 'linear',
			animationDelay         : 0,
			animationIterationCount: 0,
			animationDirection     : 'alternate'
		},
		// 設定する値の入力要素のパーツ
		inputParts: [
			{
				type : 'number',
				name : '0',
				label: 'はじめ',
				attr : {
					placeholder: '整数指定',
					step       : 1,
					value      : 0,
					min        : 0,
					max        : 100
				}
			},
			{
				type : 'number',
				name : '100',
				label: 'おわり',
				attr : {
					placeholder: '整数指定',
					step       : 1,
					value      : 0,
					min        : 0,
					max        : 100
				}
			}
		],
		// 追加パーツ
		misc: {
		},
	}
};
