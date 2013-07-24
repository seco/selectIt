(function(){

	$.fn.selectIt = function(opt_ext){

		return this.each(function(){

			var self = this;

			//default options
			var defaults = {
				list : [],
				item_number : 15,
				previous_label : 'Prev',
				next_label : 'Next',
				select_label : '',
				select_value : '',
				full_paging : false
			};

			//merged user options with default
			var options = $.extend(defaults, opt_ext);

			//required selectIt option value - select value
			if(options.select_value==''){
				alert('Required field select_value not set!')
				return;
			}

			//required selectIt option value - label value
			if(options.select_label==''){
				alert('Required field select_label not set!')
				return;
			}			


/***************************************************************** VARIABLES *******************************************************************/


			//list of items to be searched
			self.init_list = options.list;

			//number of page rows in select
			self.item_number = options.item_number;

			//filtered list by search term
			self.filtered_list = self.init_list;

			//total number of pages of the filtered list
			self.page_number = Math.floor(self.filtered_list.length/self.item_number) + 1

			//current displayed page
			self.current_page = 1;

			//form input search value
			self.search_value = '';

			//list to be displayed (one page)
			self.displayed_list = [];

			//list selected value
			self.chosen_value = {};


/***************************************************************** FUNCTIONS *******************************************************************/


			//getting css from any dom element
			var getElementStyle = function(dom){

		        var style;
		        var returns = {};
		        // FireFox and Chrome 
		        if(window.getComputedStyle){
		            style = window.getComputedStyle(dom, null);
		            for(var i = 0, l = style.length; i < l; i++){
		                var prop = style[i];
		                var val = style.getPropertyValue(prop);
		                returns[prop] = val;
		            }
		            return returns;
		        }
		        // IE and Opera
		        if(dom.currentStyle){
		            style = dom.currentStyle;
		            for(var prop in style){
		                returns[prop] = style[prop];
		            }
		            return returns;
		        }
		        // Style from style attribute
		        if(style = dom.style){
		            for(var prop in style){
		                if(typeof style[prop] != 'function'){
		                    returns[prop] = style[prop];
		                }
		            }
		            return returns;
		        }
		        return returns;

			};


			//
			var spawnNavigationNumber = function(id){

				var nav = '';
				if(id==self.current_page){
					nav += '<span class="selectIt_pagination_item active">' + id + '</span>';
				}else{
					nav += '<span class="selectIt_pagination_item inactive">' + id + '</span>';
				}

				return nav;

			};


			//navigation factory - ALPHA
			var navigationFactory = function(){

				var pagination_navigation = ""


				if(self.page_number<4){

					for(var i = 1; i <= 3; i++){
						pagination_navigation += spawnNavigationNumber(i)
					}
					
				}else{

					var start = self.current_page - 2;

					if(self.current_page==1){
						start = self.current_page;
					}

					var end = Number(self.current_page) + 2;

					for(var i = start; i <= end; i++){
						pagination_navigation += spawnNavigationNumber(i)
					}
					
					pagination_navigation += '<span style="float:left; cursor:default;">...</span>';
					pagination_navigation += spawnNavigationNumber(self.page_number)

				}

				return pagination_navigation;

			};

			//switch to the next result set page
			self.nextPage = function(){

				if(self.current_page < self.page_number){
					self.current_page++;
					self.changePage(self.current_page);
				}

			};

			//switch to the previous result set page
			self.prevPage = function(){

				if(self.current_page > 1){
					self.current_page--;
					self.changePage(self.current_page);
				}

			};


			self.setPage = function(num){
				self.current_page = num;
				self.changePage(self.current_page);
			};


			//change the result set displayed page
			self.changePage = function(page_num, initial_change){

				var start = page_num * options.item_number - options.item_number;
				var end = page_num * options.item_number;
				self.displayed_list = [];

				for(var i=start; i<end; i++){
					if(self.filtered_list[i]!=undefined)
						self.displayed_list.push(self.filtered_list[i]);
				}

				self.drawSelect(self.displayed_list, initial_change);
				
			};

			//display selected result set page
			self.drawSelect = function(opt, initial_load){

				result_list.html('');
				
				for(var i in opt){
					result_list.append('<tr><td><label data-selvalue="' + opt[i][options.select_label] +'"">' + opt[i][options.select_value] + '</label></td></tr>')
				}

				if(options.full_paging){

					if(self.page_number > 1){
						result_list.append('<tr><td><div class="selectIt_pagination">' + navigationFactory() + '</div></td></tr>');
					}

				}else{

					var prev_button = '<tr><td class="resultListPrevPage">' + options.previous_label + '</td></tr>';
					var next_button = '<tr><td class="resultListNextPage">' + options.next_label + '</td></tr>';

					if(self.page_number > 1){
						result_list.prepend(prev_button);
						result_list.append(next_button);
					}
					
				}


				if(!initial_load)
					result_list.show();

			};


			//result set reset function
			self.resetFilterList = function(new_filtered_list){

				self.page_number = Math.floor(new_filtered_list.length/self.item_number) + 1;
				self.filtered_list = new_filtered_list;
				self.changePage(1, false);

			};


/************************************************************** 'The DOM part' ****************************************************************/


			//container for input field and result list
			var container = $('<div>').addClass('selectIt_main_container');

			var original_select = $(this);

			//search input field is added data-selvalue attribute, added css from the DOM original select and transported into the container
			var search_input = $('<input>').attr('data-selvalue', '').css(getElementStyle(this));

			//we hide the original select
			original_select.hide();

			//result list is a simple table, with width of the search input field
			var result_list = $('<table>').addClass('selectIt_result_list').css('width', search_input.width() + 2 + 'px').hide();

			//DOM position of the search input field
			var search_input_document_placeholder = original_select.parent();

			container.append(search_input).append(result_list);

			//appending whole container back to the initial search input field DOM parent
			search_input_document_placeholder.append(container);


/******************************************************************* EVENTS *******************************************************************/


			//search input field on change event - searching in the initial list
			self.filterChange = function(){

	        	var new_list = new Array();
	        	var search_term = search_input.val();

	        	if(search_term.length>1){

		        	for(var i in self.init_list){
		        		var item = self.init_list[i];

		        		if(item[options.select_value].toLowerCase().indexOf(search_term.toLowerCase())!== -1){
		        			
		        			new_list.push(item);

		        		}

		        	}

	        		self.resetFilterList(new_list);
	        	}
	        	else{
	        		self.resetFilterList(self.init_list);
	        	}

			};


			//show or hide result list event
			search_input.click(function(){
				result_list.toggle();
			});

			//
			result_list.blur(function(){
				result_list.hide();
			});

			//previous and next button click events
			container.on('click', 'td.resultListPrevPage', self.prevPage);
			container.on('click', 'td.resultListNextPage', self.nextPage);

			//select list item event
			container.on('click', 'table.selectIt_result_list tr', function(){

				var $self = $(this);
				var label = $self.find('label');

				if(label.size()>0){
					self.chosen_value = { 
						label : label.text(), 
						value : label.data('selvalue') 
					};

					result_list.hide();

					search_input.val(self.chosen_value.label);
					search_input.data('selvalue', self.chosen_value.value);

					original_select.html('');
					original_select.append('<option value="' + self.chosen_value.value + '">' + self.chosen_value.label + '<option>')
				}

			})

			container.on('click', 'span.inactive', function(){
				self.setPage($(this).text());
			});

			search_input.keyup(self.filterChange);


/******************************************************************* Initial page *******************************************************************/


			//initial load of the first page
			self.changePage(1, true);	

		});

	};

})(jQuery);