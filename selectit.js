(function($){

	var SelectIt = function(html_element, options_external){

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
		this.options = $.extend(defaults, options_external);

		//required selectIt option value - select value
		if(this.options.select_value==''){
			console.log('Required field select_value not set!')
			return $(html_element);
		}

		//required selectIt option value - label value
		if(this.options.select_label==''){
			console.log('Required field select_label not set!')
			return $(html_element);
		}


		//list of items to be searched
		this.init_list = this.options.list;
		//number of page rows in select
		this.item_number = this.options.item_number;
		//filtered list by search term
		this.filtered_list = this.init_list;
		//total number of pages of the filtered list
		this.page_number = Math.floor(this.filtered_list.length/this.item_number) + 1
		//current displayed page
		this.current_page = 1;
		//form input search value
		this.search_value = '';
		//list to be displayed (one page)
		this.displayed_list = [];
		//list selected value
		this.chosen_value = {};

		//initial html setup
		this.set_up_html(html_element);
		//initial load of the first page
		this.change_page(1, true);	

	}


	SelectIt.prototype.get_html_element_style = function(dom){

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

	}


	SelectIt.prototype.spawn_navigation_number = function(id){

		var nav = '';
		if(id==this.current_page){
			nav += '<span class="selectIt_pagination_item active">' + id + '</span>';
		}else{
			nav += '<span class="selectIt_pagination_item inactive">' + id + '</span>';
		}

		return nav;

	};


	//navigation factory - ALPHA
	SelectIt.prototype.navigationFactory = function(){

		var pagination_navigation = ""

		if(this.page_number<4){

			for(var i = 1; i <= 3; i++){
				pagination_navigation += spawn_navigation_number(i)
			}
			
		}else{

			var start = this.current_page - 2;

			if(this.current_page==1){
				start = this.current_page;
			}

			var end = Number(this.current_page) + 2;

			for(var i = start; i <= end; i++){
				pagination_navigation += spawn_navigation_number(i)
			}
			
			pagination_navigation += '<span style="float:left; cursor:default;">...</span>';
			pagination_navigation += spawn_navigation_number(this.page_number)

		}

		return pagination_navigation;

	};

	//switch to the next result set page
	SelectIt.prototype.next_page = function(){

		if(this.current_page < this.page_number){
			this.current_page++;
			this.change_page(this.current_page);
		}

	};

	//switch to the previous result set page
	SelectIt.prototype.prev_page = function(){

		if(this.current_page > 1){
			this.current_page--;
			this.change_page(this.current_page);
		}

	};


	SelectIt.prototype.set_page = function(num){
		this.current_page = num;
		this.change_page(this.current_page);
	};


	//change the result set displayed page
	SelectIt.prototype.change_page = function(page_num, initial_change){

		var start = page_num * this.options.item_number - this.options.item_number;
		var end = page_num * this.options.item_number;
		this.displayed_list = [];

		for(var i=start; i<end; i++){
			if(this.filtered_list[i]!=undefined)
				this.displayed_list.push(this.filtered_list[i]);
		}

		this.draw_select(this.displayed_list, initial_change);
		
	};

	//display selected result set page
	SelectIt.prototype.draw_select = function(opt, initial_load){

		var result_list = this.container.find('table').first().html('');
		
		for(var i in opt){
			result_list.append('<tr><td><label data-selvalue="' + opt[i][this.options.select_label] +'"">' + opt[i][this.options.select_value] + '</label></td></tr>')
		}

		if(this.options.full_paging){

			if(this.page_number > 1){
				result_list.append('<tr><td><div class="selectIt_pagination">' + navigationFactory() + '</div></td></tr>');
			}

		}else{

			var prev_button = '<tr><td class="resultListprev_page">' + this.options.previous_label + '</td></tr>';
			var next_button = '<tr><td class="resultListnext_page">' + this.options.next_label + '</td></tr>';

			if(this.page_number > 1){
				result_list.prepend(prev_button);
				result_list.append(next_button);
			}
			
		}

		if(!initial_load)
			result_list.show();

	};


	SelectIt.prototype.search = function(search_term){

		var new_list = new Array();

    	if(search_term.length>1){

        	for(var i in this.init_list){
        		var item = this.init_list[i];

        		if(item[this.options.select_value].toLowerCase().indexOf(search_term.toLowerCase())!== -1){
        			
        			new_list.push(item);

        		}

        	}

    		this.reset_filter_list(new_list);
    	}
    	else{
    		this.reset_filter_list(this.init_list);
    	}

	};


	//result set reset function
	SelectIt.prototype.reset_filter_list = function(new_filtered_list){

		this.page_number = Math.floor(new_filtered_list.length/this.item_number) + 1;
		this.filtered_list = new_filtered_list;
		this.change_page(1, false);

	};


/************************************************************** 'The DOM part' ****************************************************************/


	SelectIt.prototype.set_up_html = function(elt){

		var self = this;

		//container for input field and result list
		this.container = $('<div>').addClass('selectIt_main_container');

		var original_select = $(elt);

		//search input field is added data-selvalue attribute, added css from the DOM original select and transported into the container
		var search_input = $('<input>').attr('data-selvalue', '').css(this.get_html_element_style(elt));

		//we hide the original select
		original_select.hide();

		//result list is a simple table, with width of the search input field
		var result_list = $('<table>').addClass('selectIt_result_list').css('width', search_input.width() + 2 + 'px').hide();

		//DOM position of the search input field
		var search_input_document_placeholder = original_select.parent();

		this.container.append(search_input).append(result_list);

		//appending whole container back to the initial search input field DOM parent
		search_input_document_placeholder.append(this.container);



		//EVENTS

		//show or hide result list event
		search_input.click(function(){
			result_list.toggle();
		});

		//
		result_list.blur(function(){
			result_list.hide();
		});

		//previous and next button click events
		this.container.on('click', 'td.resultListprev_page', function(){ self.prev_page() });
		this.container.on('click', 'td.resultListnext_page', function(){ self.next_page() });

		//select list item event
		this.container.on('click', 'table.selectIt_result_list tr', function(){

			var $this = $(this);
			var label = $this.find('label');

			if(label.size()>0){
				this.chosen_value = { 
					label : label.text(), 
					value : label.data('selvalue') 
				};

				result_list.hide();

				search_input.val(this.chosen_value.label);
				search_input.data('selvalue', this.chosen_value.value);

				original_select.html('');
				original_select.append('<option value="' + this.chosen_value.value + '">' + this.chosen_value.label + '<option>')
			}

		})

		this.container.on('click', 'span.inactive', function(){
			this.set_page($(this).text());
		});

		search_input.keyup(function(){
	    	self.search($(this).val());
		});		

	};


	//browser check
    function browser_is_supported(){
		var ref;
	    if (window.navigator.appName === "Microsoft Internet Explorer") {
	        return (null !== (ref = document.documentMode) && ref >= 8);
	    }
	    return true;
    };


	$.fn.extend({

		selectit : function(options){

			if(!browser_is_supported()){
				return this;
			}

			return this.each(function(){
				return new SelectIt(this, options);
			});

		}
	});

})(jQuery);