/**
 * SelectIt jQuery plugin
 * https://github.com/lsiric/selectIt
 *
 * Copyright 2013 Luka Siric <siric.luka@gmail.com>
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
*/


(function($){

	var SelectIt = function(html_element, options_external){

		//default options
		var defaults = {
			list : [],
			item_number : 15,
			previous_label : 'Prev',
			next_label : 'Next',
			select_label : '',
			select_value : ''
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
		this.change_page(1);

		//close the result list on the initial load
		this.result_list.hide();

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


	//change the result set displayed page
	SelectIt.prototype.change_page = function(page_num){

		//start and end indexes
		var start = page_num * this.options.item_number - this.options.item_number;
		var end = page_num * this.options.item_number;
		this.displayed_list = [];

		for(var i=start; i<end; i++){
			if(this.filtered_list[i])
				this.displayed_list.push(this.filtered_list[i]);
		}

		this.draw_select(this.displayed_list);
		
		//if on the first page, add inactive class to the previous button to point it out, else remove it 
		if(this.current_page === 1)
			$('.selectIt_prev_page').addClass('inactive');
		else
			$('.selectIt_prev_page').removeClass('inactive');

		//if on the last page, add inactive class to the next button to point it out, else remove it 
		if(this.current_page === this.page_number)
			$('.selectIt_next_page').addClass('inactive');
		else
			$('.selectIt_next_page').removeClass('inactive');

	};


	//display selected result set page
	SelectIt.prototype.draw_select = function(opt){

		//clean current result list
		var result_list = this.container.find('ul').first().html('');
		
		//append the results
		for(var i in opt){
			result_list.append('<li><div class="selectIt_item" data-selvalue="' + opt[i][this.options.select_value] +'">' + opt[i][this.options.select_label] + '</div></li>')
		}

		//append the buttons
		var prev_button = '<li><div class="selectIt_result_list_button selectIt_prev_page">' + this.options.previous_label + '</div></li>';
		var next_button = '<li><div class="selectIt_result_list_button selectIt_next_page">' + this.options.next_label + '</div></li>';

		result_list.prepend(prev_button);
		result_list.append(next_button);

		result_list.show();

	};


	//search function - to be extended with proper regex search
	SelectIt.prototype.search = function(search_term){

		var new_list = new Array();

		//search does not trigger of search term is not at least 2 chars long
    	if(search_term.length>1){

        	for(var i in this.init_list){
        		var item = this.init_list[i];

        		//using plain indexOf instead of regex
        		if(item[this.options.select_label].toLowerCase().indexOf(search_term.toLowerCase())!== -1){
        			
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
		this.current_page = 1;
		this.change_page(this.current_page);

	};

	//plugin html - result list html element 'table' to be replaced by html element 'list'
	SelectIt.prototype.set_up_html = function(elt){

		var self = this;
		self.original_select = $(elt);

		//container for input field
		this.container = $('<div>').addClass('selectIt_main_container').width(self.original_select.width());

		//search input field is added data-selvalue attribute
		var input_attributes = {
			'data-selvalue' : '',
			'class' : 'selectIt_search_field'
		};

		//setting search input width as the width of the original select element
		this.search_input = $('<input>', input_attributes).width(self.original_select.width());

		//same thing goes with width for the result list
		this.result_list = $('<ul>').addClass('drop').css('width', self.original_select.width() + Number('8') + 'px').hide();

		//appending search input field and the result list to the container
		this.container.append(this.search_input).append().append(this.result_list);

		//appending whole container after the select
		self.original_select.after(this.container);

		//we hide the original select
		self.original_select.hide();

		//result list is positioned absolute, so we have to get the container height, to display result list right under it
		var offset_top = this.container.height();

		this.result_list.css({ top : offset_top });

	};

	//EVENTS
	//more events to be added, specially for opening/closing of the select
	SelectIt.prototype.bind_events = function(){

		var self = this;
		
		//show or hide result list event
		this.search_input.click(function(){
			self.search_input_click();
		});

		//left click on result list
		this.result_list.mouseup(function(evt){
			if(evt.which===1)
				self.result_list_mouseup(evt);
		});

		//search input field event 
		this.search_input.keyup(function(){
	    	self.search($(this).val());
		});

		//hiding the result list when anything else except selectIt components is clicked
		$(document).click(function(evt){
			if(!$(evt.target).hasClass('selectIt_search_field') && !$(evt.target).hasClass('selectIt_result_list_button') && !$(evt.target).hasClass('selectIt_item'))
				self.result_list.hide();
		});

	};	


	SelectIt.prototype.search_input_click = function(){
		this.result_list.toggle();
	};


	SelectIt.prototype.result_list_mouseup = function(evt){

	    var $this = $(evt.target);

	    //click event for result list item - setting the clicked value as the selected value
		if($this.hasClass('selectIt_item')){

			this.chosen_value = { 
				label : $this.text(), 
				value : $this.data('selvalue') 
			};

			this.result_list.hide();

			this.search_input.val(this.chosen_value.label);
			this.search_input.data('selvalue', this.chosen_value.value);

			this.original_select.html('');

			//setting the chosen value for the initial select (which is hidden now)
			this.original_select.append('<option value="' + this.chosen_value.value + '">' + this.chosen_value.label + '<option>')				

		}
	    //click event for prevoious button
		else if($this.hasClass('selectIt_prev_page')){
			this.prev_page();
		}
	    //click event for next button
		else if($this.hasClass('selectIt_next_page')){
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