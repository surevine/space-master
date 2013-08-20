/*
 * Copyright (C) 2008-2010 Surevine Limited.
 *   
 * Although intended for deployment and use alongside Alfresco this module should
 * be considered 'Not a Contribution' as defined in Alfresco'sstandard contribution agreement, see
 * http://www.alfresco.org/resource/AlfrescoContributionAgreementv2.pdf
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
(function()
{
    /**
     * YUI Library aliases
     */
    var Dom = YAHOO.util.Dom, Event = YAHOO.util.Event, Element = YAHOO.util.Element;

    /**
     * Alfresco Slingshot aliases
     */
    var $html = Alfresco.util.encodeHTML;

    /**
     * EnhancedSecuritySelectorAdvancedSingleGroupSelector constructor.
     * 
     * @namespace Alfresco
     * @class EnhancedSecuritySelectorAdvancedSingleGroupSelector
     * @param {String}
     *                htmlId The HTML id of the parent div or span
     * @return {Alfresco.EnhancedSecuritySelectorGroupsAdvancedSelector} The new
     *         instance
     * @constructor
     */
    Alfresco.EnhancedSecuritySelectorAdvancedSingleGroupSelector = function(
            htmlId)
    {
        /* Mandatory properties */
        this.name = "Alfresco.EnhancedSecuritySelectorAdvancedSingleGroupSelector";

        // Do not allow IDs with double quotes as this presents an XSS vector.
        // Other theoretically invalid HtmlIds will be processed OK
        if (!htmlId.indexOf('"') == -1) {
            throw new Error("HTML Id " + htmlId
                    + " cannot contain double quote marks");
        }

        this.id = htmlId;

        /* Initialise prototype properties */
        this.widgets = {};
        this.modules = {};

        /* Register this component */
        Alfresco.util.ComponentManager.register(this);

        /* Load YUI Components */
        Alfresco.util.YUILoaderHelper.require([ "json", "connection", "event",
                "button" ], this.onComponentsLoaded, this);

        return this;
    };

    Alfresco.EnhancedSecuritySelectorAdvancedSingleGroupSelector.prototype = {
        /**
         * Object container for initialization options
         * 
         * @property options
         * @type object
         */
        options : {
            /**
             * Space separated string of groups this selector can select
             */
            groupsString : "NOTHING AT ALL",
            
            /**
             * Detailed groups array, groups string can be derived from this if needed
             */
			groupsDetailArray : [],
			
            /**
             * Callback method for when the groups are updated. Function will be
             * called with three parameters: this object, a group, and a boolean
             * of whether to add the group (true), or remove it (false)
             */
            updateCallback : {
                fn : function(obj, group, add)
                {
                },
                scope : this
            },

            /**
             * Callback method for when the selection state changes between nothing selected
             * and something selected (including the "none" option)
             */
            hasSelectionCallback : {
                fn : function(obj, hasSelection)
                {
                },
                scope : this
            },

            /**
             * Callback method for when the selection state changes between nothing selected
             * and something selected (including the "none" option)
             */
            renderedCallback : {
                fn : function(obj)
                {
                },
                scope : this
            },

            /**
             * Title of the type of group selected by this control
             */
            title : "",

            /**
             * Whether this groups selector should be for open groups
             */
            isOpenGroup : null
        },

        /**
         * Object container for storing YUI widget instances.
         * 
         * @property widgets
         * @type object
         */
        widgets : null,

        /**
         * Object container for storing module instances.
         * 
         * @property modules
         * @type object
         */
        modules : null,

        /**
         * Set multiple initialization options at once.
         * 
         * @method setOptions
         * @param obj
         *                {object} Object literal specifying a set of options
         * @return {Alfresco.EnhancedSecuritySelectorGroupsAdvancedSelector}
         *         returns 'this' for method chaining
         */
        setOptions : function(obj)
        {
            this.options = YAHOO.lang.merge(this.options, obj);
            return this;
        },

        /**
         * Set messages for this component.
         * 
         * @method setMessages
         * @param obj
         *                {object} Object literal specifying a set of messages
         * @return {Alfresco.EnhancedSecuritySelectorGroupsAdvancedSelector}
         *         returns 'this' for method chaining
         */
        setMessages : function(obj)
        {
            Alfresco.util.addMessages(obj, this.name);
            return this;
        },

        /**
         * Fired by YUILoaderHelper when required component script files have
         * been loaded into the browser.
         * 
         * @method onComponentsLoaded
         */
        onComponentsLoaded : function()
        {
            Event.onContentReady(this.id, this.onReady, this, true);
        },

        /**
         * Fired by YUI when parent element is available for scripting.
         * Component initialisation, including instantiation of YUI widgets and
         * event listener binding.
         * 
         * @method onReady
         */
        onReady : function()
        {
            var parent = Dom.get(this.id);
            this.addElements(parent);

            this.widgets.noneButton = Alfresco.util.createYUIButton(this,
                    "none-button", this.noneClicked, {
                        value : "none",
                        label : this._msg("single-group-selector.button.none",
                                this.options.title.replace(/s$/,'')),
                        type : "checkbox"
                    });

//            this.showTitle(this.options.title);
            this.showOptions(this.options.groupsDetailArray);

            this.stickGroups(this.stickyGroups);
            
            this.options.renderedCallback.fn.call(this.options.renderedCallback.scope);
        },

        /**
         * Called by onReady, this method renders the basic structure of the
         * component, without any data or event listeners, into the specified
         * parent element
         * 
         * @param parent
         *                {div/span} A container, which should be a div or a
         *                span, into which to insert HTML
         * @method addElements
         */
        addElements : function(parent)
        {
            var id = this.id;
            
            var container = document.createElement("div");
            
            // The header
            var header = document.createElement("h4");
            Dom.addClass(header, "markingName");
            header.appendChild(document.createTextNode(this.options.title));
            
            container.appendChild(header);
            
            // The none button
            var buttonContainer = document.createElement("div");
            Dom.addClass(buttonContainer, "markingButtonContainer");
            buttonContainer.setAttribute("id", id + "-buttons-container");
            
            var noneButton = document.createElement("input");
            noneButton.setAttribute("value", "none");
            noneButton.setAttribute("id", id + "-none-button");
            Dom.addClass(noneButton, "markingButton");
            Dom.addClass(noneButton, "noneButton");
            
            buttonContainer.appendChild(noneButton);
            
            container.appendChild(buttonContainer);
            
            // The list
            var list = document.createElement("ul");
            list.setAttribute("id", id + "-list-container");
            Dom.addClass(list, "markingListContainer");
            Dom.addClass(list, "axs");
            Dom.addClass(list, "listbox");
            Dom.addClass(list, "aria-multiselectable");
            
            container.appendChild(list);
            
            parent.appendChild(container);
            
/*            
            parent.innerHTML += '  <h4 id="'
                    + $html(id)
                    + '-label" class="markingName"> </h4>'
                    + '  <div id="'
                    + $html(id)
                    + '-buttons-container" class="markingButtonContainer">'
                    + '    <input type="checkbox" value="None" id="'
                    + $html(id)
                    + '-none-button" class="markingButton noneButton"></input>'
                    + '  </div>'
                    + '  <ul id="'
                    + $html(id)
                    + '-list-container" class="markingListContainer axs listbox aria-multiselectable">'
                    + '  </ul>';
*/
        },

        /**
         * Event handler fired when a user click on the group. Toggles whether
         * or not the group is selected by adding/removing some classes, then
         * fires the callback to indicate whether the group has been added or
         * removed
         * 
         * @param event
         *                {event} event object from YUI
         * @method onGroupClick
         */
        onGroupClick : function(event)
        {

            // set matchedEl to the element we just clicked
            var matchedEl = event.srcElement;
            if (matchedEl == null) // Firefox support
            {
                matchedEl = event.originalTarget;
            }
            
            if (!Dom.hasClass(matchedEl, "disabled") && !Dom.hasClass(matchedEl, "stuck")) {
                if (Dom.hasClass(matchedEl, "selected")) {
                    this.deSelectGroup(matchedEl);
                } else {
                    this.selectGroup(matchedEl);
                }
            }

            YAHOO.util.Event.stopEvent(event);
        },

        /**
         * @private
         */
        selectGroup : function(groupElement, allowMultiple)
        {
            if (!Dom.hasClass(groupElement, "selected")) {
                if(!allowMultiple && this.forceSingleSelection()) {
                    this.deselectAll();
                    
                    // Double check that none are still selected
                    if(this.getNumberOfSelectedGroups() > 0) {
                        return;
                    }
                }
                
                Dom.addClass(groupElement, "selected");
                Dom.removeClass(groupElement, "aria-checked-false");
                Dom.addClass(groupElement, "aria-checked-true");
                this.options.updateCallback.fn.call(
                        this.options.updateCallback.scope, this,
                        groupElement.firstChild.nodeValue, true);

                this.updateStatusOfNoneButton();
            }
        },

        /**
         * @private
         */
        deSelectGroup : function(groupElement)
        {
            // Don't allow any stuck groups to be deselected
            if (Dom.hasClass(groupElement, "selected")
                    && !Dom.hasClass(groupElement, "stuck")) {
                Dom.removeClass(groupElement, "selected");
                Dom.removeClass(groupElement, "aria-checked-true"); // Screen
                // reader
                // support
                Dom.addClass(groupElement, "aria-checked-false");
                this.options.updateCallback.fn.call(
                        this.options.updateCallback.scope, this,
                        groupElement.firstChild.nodeValue, false);

                this.updateStatusOfNoneButton();
            }
        },

        /**
         * Event handler for the "None" button. The handler modifies any groups
         * that are in the wrong state, firing the callback method as required.
         * 
         * @private
         * @method noneClicked
         */
        noneClicked : function()
        {
            if (this.widgets.noneButton.get("checked")) {
                this.deselectAll();
            }
            
            this.options.hasSelectionCallback.fn.call(
                    this.options.hasSelectionCallback.scope, this,
                    this.hasSelection());
        },
        
        deselectAll : function()
        {
            // Get all groups
            var groups = YAHOO.util.Selector.query('ul[id=' + this.id
                    + '-list-container] li:not(.invisible) a');

            for ( var i = 0; i < groups.length; i++) {
                this.deSelectGroup(groups[i]);
            }
        },

        /**
         * Updates the checked status of the "none" button (if it exists)
         */
        updateStatusOfNoneButton : function()
        {
            if (this.widgets.noneButton) {
                var selected = this.widgets.noneButton.get("checked");
                var newSelected = this.getNumberOfSelectedGroups() == 0;
                
                if(selected != newSelected) {
                    this.widgets.noneButton.set("checked", newSelected);
                    
                    this.options.hasSelectionCallback.fn.call(
                            this.options.hasSelectionCallback.scope, this,
                            newSelected);
                }
            }
        },

        /**
         * Event handler for the "None" button. The handler modifies any groups
         * that are in the wrong state, firing the callback method as required.
         * 
         * @private
         * @param e
         *                {event} The event we are handling
         * @method noneClicked
         */
        allClicked : function(e)
        {
            this.selectAll();
        },
        
        /**
         * Selects all the groups
         * 
         * @method selectAll
         */
        selectAll : function()
        {
            // Get all groups
            var groups = YAHOO.util.Selector.query('ul[id=' + this.id
                    + '-list-container] li:not(.invisible) a');

            for ( var i = 0; i < groups.length; i++) {
                this.selectGroup(groups[i]);
            }

            this.updateStatusOfNoneButton();            
        },

        /**
         * Simple method to display the title of the group selector as passed
         * into options
         * 
         * @param title
         *                The title of this group selector, which is usually the
         *                name of the group category the selector is allowing
         *                selections from
         * @method showTitle
         */
        showTitle : function(title)
        {
            var titleEl = Dom.get(this.id + '-label');

            // Remove any existing child nodes
            titleEl.innerHtml = "";

            // Add the title node
            titleEl.appendChild(document.createTextNode(title));
        },

        /**
         * Is this selector selecting values from an open group?
         * 
         * @return
         */
        isOpenGroup : function()
        {
            return this.options.isOpenGroup;
        },

        /**
         * Is this selector selecting values from organisations?
         * 
         * @return
         */
        isOrganisations : function()
        {
            return false;
        },

        /**
         * How many groups are currently selected?
         * 
         * @return The number of currently selected groups
         */
        getNumberOfSelectedGroups : function()
        {
            return YAHOO.util.Selector.query('ul[id=' + this.id
                    + '-list-container] li a.selected').length;
        },

        /**
         * How many groups are in the list
         * 
         * @return The number of groups in the list
         */
        getNumberOfGroups : function()
        {
            return YAHOO.util.Selector.query('ul[id=' + this.id
                    + '-list-container] li').length;
        },
        
        /**
         * Returns <code>true</code> if all the options have been selected
         */
        areAllSelected : function()
        {
            return (this.getNumberOfSelectedGroups() == this.getNumberOfGroups());
        },

        /**
         * Returns <code>true</code> if the user has selected something
         * (including the "none" option) from the selector.
         * 
         * @return boolean <code>true</code> if something has been selected,
         *         <code>false</code> otherwise
         */
        hasSelection : function()
        {
            // Return true if we have any groups seletced, or the "none" button is selected
            return (this.getNumberOfSelectedGroups() > 0 || (this.widgets.noneButton && this.widgets.noneButton
                    .get("checked")));
        },

        /**
         * Returns an array with all the selected groups.
         * 
         * @return {array} of selected groups
         */
        getSelectedGroups : function()
        {
            var groups = [];

            var result = YAHOO.util.Selector.query('ul[id=' + this.id
                    + '-list-container] li a.selected');

            for ( var i in result) {
                groups.push(result[i].innerHTML);
            }

            return groups;
        },

        createToolTipText: function (group)
        {
        	var body = "<table class='eslGroupDescription-wrapper'> <tr class='eslGroupDescription-name'><td class='title'>Name:</td><td class='name'>"+group.name+"</td></tr>"
        	         + "<tr class='eslGroupDescription-description'><td class='title'>Description:</td><td class='description'>"+group.description+"</td></tr>";
        	         /*
        	         // Patch for 2.8.4 release
        	           + "<tr class='eslGroupDescription-pa'><td class='title'>Permission Authorities:</td><td class='pa'>";
        	for (var i=0; i < group.permissionAuthorities.length; i++)
        	{
        		body+="<div class='pa-inner'>"+group.permissionAuthorities[i]+"</div>";
        	}
        	body += "</td></tr></table>";*
        	*/
        	body +="</table>";
        	return body;
        },

        /**
         * Render a given set of groups as list items inside the list-container.
         * This method renders each item unchecked
         * 
         * @param groups a group-markings array with name and description properties
         * @method showOptions
         */
        showOptions : function(groups)
        {
            var listBox = Dom.get(this.id + '-list-container');

            for ( var i = 0; i < groups.length; i++) {
                var name = groups[i].name;
                
                if (name == "") {
                    continue;
                }

				var tooltip = this.createToolTipText(groups[i]);
				
                var listItem = document.createElement("li");
                listItem.setAttribute("id", listBox.id + '-' + name);
              

                var anchor = document.createElement("a");
                anchor.setAttribute("href", "#");
                YAHOO.util.Dom.addClass(anchor,
                        "groupItem axs option aria-checked-false");

                anchor.appendChild(document.createTextNode(name));

                listItem.appendChild(anchor);
                Event.addListener(anchor, 'click', this.onGroupClick, this,
                        true);

                YAHOO.util.Dom.addClass(listItem,
                        "groupItem axs option aria-checked-false");
                        
                listBox.appendChild(listItem);
                
                this.createToolTip(listItem, tooltip);
            }
        },


		/**
 		* @private
 		*/
        createToolTip : function(context, text)
        {

	    var toolTipId = context.id + "-tooltip";
        	
            tooltip = new YAHOO.widget.Tooltip(toolTipId, {
                context : context,
                text : text,
                showDelay : 500,
                width : "30em",
                autodismissdelay : 120000,
                container: Dom.get(context).parentNode
            });

            Dom.setStyle(toolTipId, "z-index", "1000");
            Dom.addClass(toolTipId, "esl-tooltip");

            
            // Up the z-index when the tooltip is shown otherwise the layout
            // manager
            // gets really confused and the group selector is displayed over the
            // tooltip
            
	    tooltip.contextMouseOverEvent.subscribe(function(
                    context)
            {
               Dom.setStyle(toolTipId, "display", "block");
            }, context, true);

            tooltip.contextMouseOutEvent.subscribe(function(
                    context)
            {
              Dom.setStyle(toolTipId, "display", "none");
            }, context, true);
        },

        /**
         * @private
         */
        clear : function()
        {
            // Get all groups
            var groups = YAHOO.util.Selector.query('ul[id=' + this.id
                    + '-list-container] li a');

            for ( var i = 0; i < groups.length; i++) {
                // Deselect the selected groups, leave the others alone
                if (Dom.hasClass(groups[i], "selected")) {
                    this.deSelectGroup(groups[i]);
                }
            }

            this.updateStatusOfNoneButton();
        },

        /**
         * Assumes that no one group is a subset of another (or that if they
         * are, they're managed by the same object).
         * 
         * @method supportsGroup
         * @param group
         *                the group name
         * @return <code>true</code> if the group is supported,
         *         <code>false</code> otherwise.
         */
        supportsGroup : function(group)
        {
            return (this.options.groupsString.indexOf(group) != -1);
        },

        /**
         * In order to support the fact that supportsGroup may sometimes report
         * a false positive, this method fails silently if the group selected is
         * not managed by this object.
         * 
         * @method selectGroupByName
         * @param group
         *                the group name
         */
        selectGroupByName : function(group, allowMultiple)
        {
            var groups = YAHOO.util.Selector.query('li[id=' + this.id
                    + '-list-container-' + escape(group) + '] a');
            if ((groups.length > 0) && (groups[0] != null)) {
                this.selectGroup(groups[0], allowMultiple);
            }

            this.updateStatusOfNoneButton();
        },

        /**
         * Filter the groups displayed in this control, and make callbacks
         * (usually to a controller) to indicate which groups have been added or
         * removed as a result. Substequent calls to this method will reset the
         * filter, not add to it - so if a selector managed groups {A,B,C,D} and
         * is filtered once with {B,C,D} and once again with {A,B} then groups
         * {A,B} will be visible, not just {B}.
         * 
         * @param filterGroupString
         *                A Space seperated list of groups - this selector will
         *                filter out any groups not in this list. Note that this
         *                parameter could (and often will) contain elements
         *                referring to groups managed by other controls, in
         *                which case they will be ignored for the purposes of
         *                this filter - this is intentional as it means that a
         *                controller can call multiple filterGroups methods on
         *                different instances of this class with the same
         *                parameter
         * @method filterGroups
         */
        filterGroups : function(filterGroupString)
        {
            var filterGroups = filterGroupString.split(" ");
            var managedGroups = this.options.groupsString.split(" ");

            this.showAllGroups();

            for ( var i = 0; i < managedGroups.length; i++) {
                var groupString = managedGroups[i];
                if (!this.valueIsInArray(groupString, filterGroups)) {
                    this.hideGroup(groupString);
                }
            }
        },

        /**
         * If any of the given groups were hidden, unhide them. "Hidden" in this
         * context means that a CSS class of "invisible" is applied - it's up to
         * the CSS to decide what this actually means - it could use "display:
         * none;", or could choose to grey out the affected list items. Note the
         * difference in parameter between this method (whcih takes an array)
         * and hideGroup(which takes a single value)
         * 
         * @param groups
         *                Array of list items to ensure are unhidden
         * @method showGroups
         */
        showGroups : function(groups)
        {
            for ( var i = 0; i < groups.length; i++) {
                if (Dom.hasClass(groups[i], "invisible")) {
                    // groups[i].style.cssText=''; //Uncomment to test
                    // without CSS
                    Dom.removeClass(groups[i], "invisible");
                }
            }
        },

        /**
         * Calls showGroups once for every group managed by this component
         * 
         * @method showAllGroups
         */
        showAllGroups : function()
        {
            var allGroups = YAHOO.util.Selector.query('li[id^=' + this.id
                    + '-list-container-]');
            this.showGroups(allGroups);
        },

        /**
         * Opposite of showGroups, except this method only takes a single list
         * item as a parameter
         * 
         * @param group
         *                List item to hide
         * @method hideGroup
         */
        hideGroup : function(groupName)
        {
            var group = Dom.get(this.id + '-list-container-' + groupName);
            if (!Dom.hasClass(group, "invisible")) {
                // group.style.cssText='display:none;'; //Uncomment to test
                // without CSS
                Dom.addClass(group, "invisible");
            }
        },

        /**
         * Opposite of showGroups, except this method only takes a single list
         * item as a parameter
         * 
         * @param group
         *                List item to hide
         * @method hideGroup
         */
        disableGroup : function(groupName, disabled)
        {
            if (typeof disabled == 'undefined') {
                disabled = true;
            }

            var group = Dom.get(this.id + '-list-container-' + groupName);
            if (!Dom.hasClass(group, "disabled") && disabled) {
                Dom.addClass(group, "disabled");
            } else if (Dom.hasClass(group, "disabled") && !disabled) {
                Dom.removeClass(group, "disabled");
            }
        },

        disableAllGroups : function(disabled)
        {
            if (typeof disabled == 'undefined') {
                disabled = true;
            }

            // Get all groups
            var groups = YAHOO.util.Selector.query('ul[id=' + this.id
                    + '-list-container] li a');

            for ( var i = 0; i < groups.length; i++) {
                if (!Dom.hasClass(groups[i], "disabled") && disabled) {
                    Dom.addClass(groups[i], "disabled");
                } else if (Dom.hasClass(groups[i], "disabled") && !disabled) {
                    Dom.removeClass(groups[i], "disabled");
                }
            }
        },

        /**
         * Is the given value in the given array?
         * 
         * @method valueIsInArray
         */
        valueIsInArray : function(value, arr)
        {
            for ( var i = 0; i < arr.length; i++) {
                if (arr[i] == value) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Prevent them from being unset - this code assumes they have already
         * been set.
         * 
         * @param groups
         *                Space seperated list of sticky groups.
         * @method stickGroups
         */
        stickGroups : function(groups)
        {
            this.stickyGroups = groups;

            var i;

            var stuckGroups = YAHOO.util.Selector.query('ul[id=' + this.id
                    + '-list-container] li a.stuck');

            for (i in stuckGroups) {
                Dom.removeClass(stuckGroups[i], "stuck");
            }

            var groupFound = false;
            
            // If we've got any sticky groups, and this isn't an open
            // group...
            if (this.stickyGroups != null && !(this.isOpenGroup())) {
                // Stick down any sticky groups
                var groupsArr = this.stickyGroups.split(" ");
                for (i = 0; i < groupsArr.length; i++) {
                    var anchor = YAHOO.util.Selector
                            .query('li[id=' + this.id + '-list-container-'
                                    + escape(groupsArr[i]) + '] a');
                    Dom.addClass(anchor, "stuck");
                    
                    if(anchor && (anchor.length > 0)) {
                        groupFound = true;
                    }
                }
            }
            
            if(groupFound && this.widgets.noneButton) {
                this.widgets.noneButton.set("disabled", true);
            } else {
            	if (this.widgets.noneButton)
            	{
            		this.widgets.noneButton.set("disabled", false);
            	}
            }
        },

        /**
         * Whether selecting all options means the same as selecting none (e.g. organisations)
         */
        allSelectedMeansNone : function()
        {
            return false;
        },
        
        /**
         * Whether to allow only one selection at a time
         */
        forceSingleSelection : function()
        {
            // TODO This is terrible.
            return this.options.title == "Groups";
        },
        
        /**
         * Whether a selection from this group type counts towards a given atomal value
         */
        countsTowardsAtomal : function(atomalValue)
        {
            return this.options.title == "Groups";
        },
        
        /**
         * Resets the control to the blank state (i.e. nothing selected and no stuck groups)
         */
        reset : function()
        {
            this.clear();
            if (this.widgets.noneButton)
            {
            	this.widgets.noneButton.set("checked", false);
            }
            this.stickGroups('');
        },
        
        /**
         * PRIVATE FUNCTIONS
         */

        /**
         * Gets a custom message
         * 
         * @method _msg
         * @param messageId
         *                {string} The messageId to retrieve
         * @return {string} The custom message
         * @private
         */
        _msg : function(messageId)
        {
            return Alfresco.util.message
                    .call(
                            this,
                            messageId,
                            "Alfresco.EnhancedSecuritySelectorAdvancedSingleGroupSelector",
                            Array.prototype.slice.call(arguments).slice(1));
        }
    };

})();
