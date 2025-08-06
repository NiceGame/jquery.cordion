(function ($) {
	/**
	 * jQuery手风琴插件
	 * @param {Object} options - 配置参数对象
	 */
	$.fn.cordion = function (options) {
		/**
		* 默认配置参数
		* @type {Object}
		* @property {number} startItem - 默认展开的项索引（从0开始）
		* @property {boolean} isAuto - 是否自动轮播（此参数已定义但未实现）
		* @property {string} align - 对齐方式（'center'|'left'|'right'，此参数已定义但未完全实现）
		* @property {string} eventHandler - 触发事件类型（'click'|'hover'）
		* @property {number} widthDisplaying - 收缩状态下每个项的显示宽度
		* @property {number} maxWidth - 展开状态下的最大宽度
		* @property {number} minWidth - 收缩状态下的最小宽度
		*/
		var settings = $.extend({
			startItem: 3,        // 页面加载时默认展开第4个项（索引从0开始）
			isAuto: false,       // 自动轮播开关（预留功能）
			align: 'center',     // 对齐方式（预留功能）
			eventHandler: 'click', // 触发方式：点击或悬停
			widthDisplaying: 70, // 收缩时每个项显示的宽度（像素）
			maxWidth: 1180,      // 展开时的最大宽度（像素）
			minWidth: 70         // 收缩时的最小宽度（像素）
		}, options);

		return this.each(function () {
			var $wrapper = $(this).find('.lof-cordion-wapper');
			var $items = $wrapper.find('ul li');
			var maxItem = $items.length;
			var resizeTimer;

			// 计算合适的尺寸
			function calculateSizes() {
				var wrapperWidth = $wrapper.width();
				var totalMinWidth = settings.minWidth * maxItem;
				var availableWidth = wrapperWidth - totalMinWidth;

				// 如果容器宽度不够，按比例缩小所有宽度
				if (wrapperWidth < totalMinWidth) {
					var scale = wrapperWidth / totalMinWidth;
					return {
						minWidth: Math.floor(settings.minWidth * scale),
						maxWidth: Math.floor(settings.maxWidth * scale),
						widthDisplaying: Math.floor(settings.widthDisplaying * scale)
					};
				}

				// 如果容器宽度足够，但需要调整maxWidth以确保所有项可见
				var adjustedMaxWidth = Math.min(settings.maxWidth, availableWidth + settings.minWidth);

				return {
					minWidth: settings.minWidth,
					maxWidth: adjustedMaxWidth,
					widthDisplaying: settings.widthDisplaying
				};
			}

			/**
			 * 初始化布局
			 * 设置所有项的基本样式和初始状态
			 */
			function initLayout() {
				var sizes = calculateSizes();
				$wrapper.css('position', 'relative');
				$items.each(function (index) {
					$(this).css({
						display: 'block',
						'z-index': index + 1,
						left: index * sizes.widthDisplaying,
						position: 'absolute',
						width: sizes.minWidth
					});
					$(this).find('.lof-shadow').css({ opacity: 1 });
					$(this).find('.lof-description').css({ height: 0, overflow: 'hidden' });
				});

				$items.eq(settings.startItem).css({ width: sizes.maxWidth });
				$items.eq(settings.startItem).find('.lof-shadow').css({ opacity: 0 });
				$items.eq(settings.startItem).find('.lof-description').animate({ height: 90 }, 700);
			}

			/**
	  * 防抖函数
	  * @param {Function} func - 要执行的函数
	  * @param {number} wait - 等待时间（毫秒）
	  * @returns {Function} 防抖处理后的函数
	  */
			function debounce(func, wait) {
				return function () {
					clearTimeout(resizeTimer);
					resizeTimer = setTimeout(func, wait);
				};
			}

			// 初始化
			initLayout();

			/**
			* 项点击/悬停事件处理
			* 控制项的展开和收缩动画
			*/
			$items.on(settings.eventHandler, function () {
				var sizes = calculateSizes();
				var activeIndex = $items.index(this);
				var left = 0;
				$items.each(function (index) {
					var width = (index === activeIndex) ? sizes.maxWidth : sizes.minWidth;
					$(this).stop().animate({ left: left, width: width }, 500);
					$(this).find('.lof-shadow').stop().animate({ opacity: index === activeIndex ? 0 : 1 }, 500);
					$(this).find('.lof-description').stop().animate({ height: index === activeIndex ? 90 : 0 }, 700);
					left += width;
				});
			});

			/**
			 * 窗口大小变化处理
			 * 使用防抖函数优化性能
			 */
			$(window).on('resize', debounce(function () {
				initLayout();

				var $activeItem = $items.filter(function () {
					return $(this).width() > calculateSizes().minWidth;
				});

				if ($activeItem.length) {
					var sizes = calculateSizes();
					$activeItem.css({ width: sizes.maxWidth });
					$activeItem.find('.lof-shadow').css({ opacity: 0 });
					$activeItem.find('.lof-description').css({ height: 90 });
				}
			}, 200));

			/**
			   * 图片预加载淡入效果
			   * 逐个显示图片，创建渐入动画
			   */
			$wrapper.find('img').css({ opacity: 0, visibility: 'hidden' }).each(function (index) {
				var $img = $(this);
				setTimeout(function () {
					$img.css('visibility', 'visible').animate({ opacity: 1 }, 1000);
				}, 500 + 100 * index);
			});
		});
	};
})(jQuery);
