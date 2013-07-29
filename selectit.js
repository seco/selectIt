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

		//bind events
		this.bind_events();
		//initial load of the first page
		this.change_page(1, true);	

	}

	//css style copy function
	SelectIt.prototype.get_html_element_style = function(dom){

        var style;
        var returns = {};
        //FireFox and Chrome 
        if(window.getComputedStyle){
            style = window.getComputedStyle(dom, null);
            for(var i = 0, l = style.length; i < l; i++){
                var prop = style[i];
                var val = style.getPropertyValue(prop);
                returns[prop] = val;
            }
            return returns;
        }
        //IE and Opera
        if(dom.currentStyle){
            style = dom.currentStyle;
            for(var prop in style){
                returns[prop] = style[prop];
            }
            return returns;
        }
        //style from style attribute
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

	//set page to a desired number
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


	SelectIt.prototype.draw_navigation = function(curr_page){

		if(this.page_number > 1){

			var pagination = '';

			if(curr_page<4){

				for(var i=1; i<4; i++){

					if(i==curr_page){
						pagination += '<div class="navigation active">' + i + '</div></li>';
					}else{
						pagination += '<div class="navigation inactive">' + i + '</div></li>';
					}

				}

			}else{

				var start = curr_page - 1;

				if(this.current_page==1){
					start = this.current_page;
				}

				var end = Number(this.current_page) + 1;

				for(var i = start; i <= end; i++){
					pagination_navigation += spawn_navigation_number(i)
				}
				
				pagination_navigation += '<li><div style="float:left; cursor:default;">...</div></li>';
				pagination_navigation += spawn_navigation_number(this.page_number)

			}

			result_list.append('<li><div class="selectIt_pagination">' + pagination + '</div></li>');
		}else{
			/*
			result_list.children().last().css('padding','4px');
			*/
		}

	};

	//display selected result set page
	SelectIt.prototype.draw_select = function(opt, initial_load){

		var result_list = this.container.find('ul').first().html('');
		
		for(var i in opt){
			result_list.append('<li><div class="selectIt_item" data-selvalue="' + opt[i][this.options.select_label] +'">' + opt[i][this.options.select_value] + '</div></li>')
		}

		if(this.options.full_paging){

			this.draw_navigation(1);

		}else{

			var prev_button = '<li><div class="selectIt_result_list_button selectIt_prev_page">' + this.options.previous_label + '</div></li>';
			var next_button = '<li><div class="selectIt_result_list_button selectIt_next_page">' + this.options.next_label + '</div></li>';

			if(this.page_number > 1){
				result_list.prepend(prev_button);
				result_list.append(next_button);
			}

		}

		if(!initial_load)
			result_list.show();

	};

	//search function - to be extended with proper regex search
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

	//plugin html - result list html element 'table' to be replaced by html element 'list'
	SelectIt.prototype.set_up_html = function(elt){

		var self = this;
		self.original_select = $(elt);

		//container for input field and result list
		this.container = $('<div>').addClass('selectIt_main_container').width(self.original_select.width());

		//search input field is added data-selvalue attribute, added css from the DOM original select and transported into the container
		var input_attributes = {
			'data-selvalue' : '',
			'class' : 'selectIt_search_field'
		};

		this.search_input = $('<input>', input_attributes).width(self.original_select.width());//.css(this.get_html_element_style(elt));

		//we hide the original select
		self.original_select.hide();

		this.result_list = $('<ul>').addClass('drop').css('width', self.original_select.width() + Number('8') + 'px').hide();

		//DOM position of the search input field
		var search_input_document_placeholder = self.original_select.parent();

		this.container.append(this.search_input).append(this.result_list);

		//appending whole container back to the initial search input field DOM parent
		search_input_document_placeholder.append(this.container);

	};

	//EVENTS
	//more events to be added, specially for opening/closing of the select
	SelectIt.prototype.bind_events = function(){

		var self = this;
		
		//show or hide result list event
		this.search_input.click(function(){
			self.search_input_click();
		});

		this.result_list.mouseup(function(evt){
			if(evt.which===1)
				self.result_list_mouseup(evt);
		});

		//pager - ALPHA
		this.container.on('click', 'div.inactive', function(){
			self.set_page($(this).text());
		});

		this.search_input.keyup(function(){
	    	self.search($(this).val());
		});		

	};	


	SelectIt.prototype.search_input_click = function(){
		this.result_list.toggle();
	};

	SelectIt.prototype.result_list_mouseup = function(evt){

	    var $this = $(evt.target);

		if($this.hasClass('selectIt_item')){

			this.chosen_value = { 
				label : $this.text(), 
				value : $this.data('selvalue') 
			};

			this.result_list.hide();

			this.search_input.val(this.chosen_value.label);
			this.search_input.data('selvalue', this.chosen_value.value);

			this.original_select.html('');
			this.original_select.append('<option value="' + this.chosen_value.value + '">' + this.chosen_value.label + '<option>')				

		}else if($this.hasClass('selectIt_prev_page')){
			this.prev_page();
		}else if($this.hasClass('selectIt_next_page')){
			this.next_page();
		}

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