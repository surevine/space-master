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

    /** Remove me for production */
    Event.throwErrors = true;

    /**
     * Alfresco Slingshot aliases
     */
    var $html = Alfresco.util.encodeHTML;

    /**
     * EnhancedSecuritySelector constructor.
     * 
     * Listens for the following events: <br>
     * <ul>
     * <li> "enhancedSecuritySelector.loadGroups" : Triggers loading the list of
     * groups from the server.<br>
     * params -> {
     * <dl>
     * <dt>"force" {boolean}
     * <dd>Always reload from the server (don't use the cached copy)
     * </dl> }
     * </ul>
     * 
     * Fires the following events:
     * <ul>
     * <li> "enhancedSecuritySelector.onGroupsLoaded" : Groups have been loaded
     * from the server.<br>
     * params -> {
     * <dl>
     * <dt>"groups" {boolean}
     * <dd>The array of group details
     * <dt>"cached"
     * <dd>Whether the groups returned is the cached version (if false then
     * they have been freshly loaded)
     * </dl> }
     * 
     * <li> "enhancedSecuritySelector.onGroupsLoadFailure" : Groups have failed
     * to load from the server.<br>
     * params -> {}
     * </ul>
     * 
     * @param {String}
     *            htmlId The HTML id of the parent element
     * @return {Alfresco.EnhancedSecuritySelector} The new instance
     * @constructor
     */
    Alfresco.EnhancedSecuritySelector = function(htmlId)
    {
        /* Mandatory properties */
        this.name = "Alfresco.EnhancedSecuritySelector";
        this.id = htmlId;

        /* Initialise prototype properties */
        this.widgets = {};
        this.modules = {};

        /* Register this component */
        Alfresco.util.ComponentManager.register(this);

        /* Load YUI Components */
        Alfresco.util.YUILoaderHelper.require( [ "json", "connection", "event", "button", "bubbling", "cookie", "event-mouseenter" ],
                this.onComponentsLoaded, this);

        /* Listen to loadGroups events */
        YAHOO.Bubbling.on("enhancedSecuritySelector.loadGroups", this.loadGroups, this);

        /* Listen to panel show/hide events */
        YAHOO.Bubbling.on("showPanel", this.onPanelDisplayed, this);
        YAHOO.Bubbling.on("hidePanel", this.onPanelHidden, this);
        YAHOO.Bubbling.on("beforeShowDiscussionReplyForm", this.onBeforeShowDiscussionReplyForm, this);
        YAHOO.Bubbling.on("afterHideDiscussionReplyForm", this.onAfterHideDiscussionReplyForm, this);
        YAHOO.Bubbling.on("afterRenderDiscussionReplies", this.onAfterRenderDiscussionReplies, this);

        var advanced = Alfresco.util.ComponentManager
                .findFirst("Alfresco.EnhancedSecuritySelectorGroupsAdvancedSelector");

        if (advanced != null)
        {
            this.advancedSelector = advanced;
            advanced.parent = this;
        }
        return this;
    };

    /**
     * Enter edit mode. Hide the "view" part of the selector and display the
     * "edit" part
     */
    Alfresco.EnhancedSecuritySelector.toEditMode = function()
    {
        var editDiv = YAHOO.util.Selector.query('div[id$=-enhancedSecuritySelector]')[0];

        if (!editDiv)
        {
            return;
        }

        var readDiv = YAHOO.util.Selector.query('div[id$=-enhancedSecuritylabelViewer]')[0];

        if (readDiv)
        {
            readDiv.style.display = 'none';
        }

        editDiv.style.display = "";
    };

    /**
     * A text label to put in a cookie instead of "" as IE6 thinks that "" in a
     * cookie means the cookie is not defined
     */
    Alfresco.EnhancedSecuritySelector.COOKIE_EMPTY_STRING_DESIGNATOR = "EMPTY_STRING";

    /**
     * A prefix which for the name of the stored cookies. The field name will be appended to this
     * to create the actual cookie name.
     */
    Alfresco.EnhancedSecuritySelector.COOKIE_PREFIX = "alfresco-eslv2-";

    /**
     * Enter read-only, AKA "view" mode. Hide the "edit" part of the selector
     * and display the "view" part
     */
    Alfresco.EnhancedSecuritySelector.toViewMode = function()
    {
        var editDiv = YAHOO.util.Selector.query('div[id$=-enhancedSecuritySelector]')[0];

        editDiv.style.display = "none";

        var readDiv = YAHOO.util.Selector.query('div[id$=-enhancedSecuritylabelViewer]')[0];

        if (readDiv)
        {
            readDiv.style.display = '';
        }
    };

    Alfresco.EnhancedSecuritySelector.prototype =
        {
            /**
             * Object container for initialization options
             * 
             * @property options
             * @type object
             */
            options :
                {
                    marking :
                        {
                            /**
                             * Space separated string of groups to initialise
                             * the selector with
                             */
                            groups : "",

                            /**
                             * Current national ownership designator
                             */
                            nod : "",

                            /**
                             * Current classification
                             */
                            classification : "",

                            /**
                             * Current atomal state
                             */
                            atomal : "",

                            /**
                             * Current freeform markings
                             */
                            freeform : "",

                            /**
                             * Current nationality caveats
                             */
                            nationality : ""
                        }
                },

            /**
             * This is the list of available control names
             */
            controlNames : [ "nod", "classification", "atomal", "groups", "freeform", "nationality" ],

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
             * Denotes whether we are currently loading the groups.
             */
            loadingGroups : false,

            /**
             * The array of groups loaded from the server. Null until they are
             * loaded.
             */
            groups : null,

            /**
             * This is the root DOM node which will be used to restrict the
             * search for existing markings on the page. Set to null to open the
             * search to the entire page.
             */
            parentRootNode : null,

            /**
             * The array of groups applied to the parent item. If null, then the
             * parent item has no groups applied, or there is no parent item.
             * For fast checking as to whether a group is in this list, use the
             * parentGroupsHash field
             */
            parentGroups : null,

            /**
             * Associated array of group names to Object()s. If
             * parentGroupsHash('foo')!=null, then 'foo' is in parentGroups
             */
            parentGroupsHash : [],

            /**
             * The parent marking. Null denotes that there is no parent marking.
             */
            parentMarking : null,

            /**
             * If true, there is a parent item and special logic should be
             * applied to group selection. If false, there isn't. If null, the
             * value hasn't been calculated yet. This field should be accessed
             * from the hasParentMarking function to avoid null return values
             */
            hasParentItem : null,

            /**
             * Reference to an advanced security selector
             */
            advancedSelector : null,

            /**
             * Flag to denote whether the selector was in edit mode before it
             * was moved to a panel
             */
            wasInEditMode : null,

            /**
             * Flag to denote if onReady has already been called. This is so
             * that I can ensure that onReady has always been called before the
             * functionality in onDOMReady is run.
             */
            onReadyCalled : false,

            /**
             * Flag to denote whether the visibility should be updated once the
             * groups have been loaded
             */
            updateVisibilityOnGroupsLoad : false,

            /**
             * Whether the selector state is currently valid
             */
            isValid : true,
            
            /**
             * The last background colour that was transitioned to
             */
            lastBackgroundColour : null,
            
            /**
             * The last label which was saved. This is to cache it on page load as
             * the saved label is actually updated during usage
             */
            lastSavedLabel : null,
            
            focusSlider : {
                /**
                 * The "focus slider" animation
                 */
                animation : null,

                /**
                 * A handle to the div used to do the clipping for the focus slider
                 */
                clippingDiv : null,

                /**
                 * The timeout for hiding the slider
                 */
                timeout : null
            },
            
            /**
             * Set multiple initialization options at once.
             * 
             * @method setOptions
             * @param obj
             *            {object} Object literal specifying a set of options
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
             *            {object} Object literal specifying a set of messages
             * @return {Alfresco.EnhancedSecuritySelectorGroupsAdvancedSelector}
             *         returns 'this' for method chaining
             */
            setMessages : function(obj)
            {
                Alfresco.util.addMessages(obj, this.name);
                return this;
            },

            /**
             * Fired by YUILoaderHelper when required component script files
             * have been loaded into the browser.
             * 
             * @method onComponentsLoaded
             */
            onComponentsLoaded : function()
            {
                Event.onContentReady(this.id, this.onReady, this, true);
            },

            /**
             * Fired by YUI when parent element is available for scripting.
             * Component initialisation, including instantiation of YUI widgets
             * and event listener binding.
             * 
             * Loads the default values, overrides these values if any cookies
             * are set, adds event listeners to the controls and updates the
             * controls to reflect the default values
             * 
             * @method onReady
             */
            onReady : function()
            {
                var controlName;
                for ( var i in this.controlNames)
                {
                    controlName = this.controlNames[i];
                    this.widgets[controlName + "Button"] = Alfresco.util.createYUIButton(this,
                            "enhancedSecuritySelector-selectorContainer-editControls-" + controlName, null,
                                {
                                    label : this._msg("control." + controlName + ".select")
                                });
                }

                this.widgets.toEditModeButton = Alfresco.util.createYUIButton(this,
                        "enhancedSecuritySelector-selectorContainer-toEditModeButton",
                        Alfresco.EnhancedSecuritySelector.toEditMode,
                            {
                                value : "toEditMode"
                            });

                this.widgets.lastMarkingButton = Alfresco.util.createYUIButton(this,
                        "enhancedSecuritySelector-lastMarkingButton",
                        this.loadLabel);

                this.widgets.lastMarkingLabel = Dom.get(this.id + "-enhancedSecuritySelector-lastMarkingLabel");
                
                this.widgets.visibilityCount = Alfresco.util.ComponentManager.get(this.id + "-visibilityCount");
                this.widgets.advancedGroupSelector = Alfresco.util.ComponentManager.get(this.id
                        + "-advancedGroupSelector");
                
                this.widgets.visibilityDrillDown = Alfresco.util.ComponentManager.get(this.id + "-visibilityDrillDown");
                
                this.addBehaviour();

                this.widgets.ribbonMessages = Alfresco.util.ComponentManager.get(this.id + "-ribbonMessages");
                
                // We have to load the groups on page load now as we need to be able to differentiate between
                // restrictions and groups
                this.loadGroups();
                
                this.cacheSavedLabel();
                this.initSavedLabelUI();

                this.initFocusSlider();
                
                /* Listen to the DOMReady event */
                Event.onDOMReady(this.onDOMReady, this, this);
            },
            
            /**
             * Called when the DOM has been fully loaded. Looks for a parent
             * marking and updates the UI accordingly.
             * 
             * We use the DOMReady event rather then the ComponentLoaded event
             * as we will be looking through the entire DOM for this element,
             * and ComponentLoaded won't guarantee the entire page will be
             * loaded.
             * 
             * @method onDOMReady
             */
            onDOMReady : function()
            {
                this.refreshAndRedraw(null);
                
                this.validate();
            },

            /**
             * Updates the hidden fields on the page
             * 
             * @private
             * @method initControls
             */
            initControls : function()
            {
                for ( var i in this.controlNames)
                {
                    controlName = this.controlNames[i];
                    var value = this.getValue(controlName);

                    if (controlName == "groups")
                    {
                        var groupsSplit = this.getGroupsSplit();
                        
                        this.saveHiddenField("closedgroups", groupsSplit.closed);
                        this.saveHiddenField("opengroups", groupsSplit.open);
                        this.saveHiddenField("organisations", groupsSplit.organisations);
                    } else {
                        this.saveHiddenField(controlName, value);
                    }
                }
            },

            /**
             * Sets the parent node which will be used to narrow to search for
             * the parent marking on the page
             * 
             * @private
             * @method setParentRootNode
             * @param rootNode
             *            the DOM node in which to search for the parent marking
             */
            setParentRootNode : function(rootNode)
            {
                this.parentRootNode = rootNode;

                this.hasParentItem = null;

                // Reset the parent permissibility stuff
                this.setPermissibleVisibilityNoWiderThanParent();
            },

            /**
             * Updates the current marking to match the parent marking
             * 
             * @private
             * @method setCurrentMarkingToParentMarking
             */
            setCurrentMarkingToParentMarking : function()
            {
                if (!this.hasParentMarking())
                {
                    return;
                }

                var parentMarking = this.getParentMarking();

                this.setControl("nod", parentMarking.nod);
                this.setControl("classification", parentMarking.PM);
                this.setControl("atomal", parentMarking.atomal);

                // Both the open and closed groups are returned as arrays so
                // when converted to a string have commas inserted
                // the regex below removes the commas and replaces with spaces.
                var groupMarkingString = (parentMarking.closedGroups + " " + parentMarking.openGroups + " " + parentMarking.organisations).replace(/,/g,
                        " ");
                this.setControl("groups", (groupMarkingString).replace("\s+", " "));
                this.setControl("freeform", parentMarking.freeform);
                this.setControl("nationality", parentMarking.eyes);
                
                this.validate();
            },

            /**
             * Updates the current marking to match the default (stored) marking
             * 
             * @private
             * @method setCurrentMarkingToDefaultMarking
             */
            setCurrentMarkingToDefaultMarking : function()
            {
                this.setControl("nod", eslConstants.getDefault("nod"));
                this.setControl("classification", this._msg("control.classification.select"));
                this.setControl("atomal", this._msg("control.atomal.select"));
                this.setControl("groups", this._msg("control.groups.select"));
                this.setControl("freeform", "");
                this.setControl("nationality", this._msg("control.nationality.select"));
            },

            /**
             * Sets the appropriate empty classes on the elements if required
             * 
             * @private
             * @method setEmptyClasses
             */
            setEmptyClasses : function()
            {
                /*
                 * var groups = Dom.get(this.id +
                 * "-enhancedSecuritySelector-selectorContainer-editControls-groups");
                 * var freeform = Dom.get(this.id +
                 * "-enhancedSecuritySelector-selectorContainer-editControls-freeform");
                 * 
                 * var groupsSet = groups.lastChild.nodeValue; var freeformSet =
                 * freeform.lastChild.nodeValue;
                 */
                var controlName, button;
                for ( var i in this.controlNames)
                {
                    controlName = this.controlNames[i];
                    button = this.widgets[controlName + "Button"];
                    value = YAHOO.lang.trim(button.get("label"));

                    if ((value == "")
                            || (value == null)
                            || (value.indexOf(Alfresco.EnhancedSecuritySelector.EMPTY_CONTROL_STRINGS[controlName]) != -1))
                    {
                        Dom.addClass(button, "blank-control");
                    }
                }
            },

            /**
             * Add event listeners to the various controls
             * 
             * @private
             * @method addBehaviour
             */
            addBehaviour : function()
            {
                // Open the advanced group selector when the user clicks on the
                // groups
                Event.addListener(this.id + "-enhancedSecuritySelector-selectorContainer-editControls-nod", 'click',
                        this.onSingleValueClick, "nod", this);
                Event.addListener(this.id + "-enhancedSecuritySelector-selectorContainer-editControls-classification",
                        'click', this.onSingleValueClick, "classification", this);
                Event.addListener(this.id + "-enhancedSecuritySelector-selectorContainer-editControls-atomal", 'click',
                        this.onSingleValueClick, "atomal", this);
                Event.addListener(this.id + "-enhancedSecuritySelector-selectorContainer-editControls-groups", 'click',
                        this.onGroupsClick, this, true);
                Event.addListener(this.id + "-enhancedSecuritySelector-selectorContainer-editControls-freeform",
                        'click', this.onFreeformClick, this, true);
                Event.addListener(this.id + "-enhancedSecuritySelector-selectorContainer-editControls-nationality",
                        'click', this.onNationalityClick, this, true);
                
                // Show the visibility drilldown if the visibility count is clicked
                var thisObj = this;
                
                this.widgets.visibilityCount.onTriggerVisibilityClick.subscribe(this.showVisibilityDrilldown, this, true);
                this.widgets.advancedGroupSelector.onTriggerVisibilityClick.subscribe(this.showVisibilityDrilldown, this, true);
            },
            
            /**
             * Displays the visibility drilldown
             */
            showVisibilityDrilldown : function(event, data) {
            	securityMarking = data[0];
            	
            	if(securityMarking) {
            		this.widgets.visibilityDrillDown.setSecurityMarking(securityMarking);
            	} else {
            		this.widgets.visibilityDrillDown.setSecurityMarking(this.getSecurityMarking());
            	}
            	this.widgets.visibilityDrillDown.show();
            },

            /**
             * Returns the current security marking represented by the ribbon.
             * 
             * @method getSecurityMarking
             * @return {Object}
             */
            getSecurityMarking : function()
            {
                var groupsSplit = this.getGroupsSplit();

                var marking =
                    {
                        nod : this.getValue("nod"),
                        classification : this.getValue("classification"),
                        atomal : this.getValue("atomal"),
                        closedGroups : groupsSplit.closed,
                        openGroups : groupsSplit.open,
                        organisations : groupsSplit.organisations,
                        nationality : this.getValue("nationality")
                    };

                return marking;
            },

            /**
             * Gets the current groups split into closed and open groups. Will
             * only work correctly after the groups have been loaded.
             * 
             * @method getGroupsSplit
             * @return {Object}
             */
            getGroupsSplit : function()
            {
                var retVal =
                    {
                        closed : [],
                        open : [],
                        organisations : []
                    };

                if (this.groups)
                {
                    /*
                     * If the groups have been loaded, we will use them to
                     * determine closed/open groups
                     */
                    var groupsString = this.getValue("groups");

                    var groups = groupsString.split(" ");

                    for ( var i in groups)
                    {
                        if (groups[i] == "")
                        {
                            continue;
                        }

                        if (this.isClosedGroup(groups[i]))
                        {
                            retVal.closed.push(groups[i]);
                        }
                        else if(this.isOrganisationGroup(groups[i]))
                        {
                            retVal.organisations.push(groups[i]);
                        }
                        else
                        {
                            retVal.open.push(groups[i]);
                        }
                    }
                }
                else
                {
                    /*
                     * If the groups have not been loaded, we will use the
                     * default groups (if the groups haven't been loaded then
                     * they won't have been changed from the defaults!)
                     */
                    if (this.hasParentMarking())
                    {
                        retVal.open = this.getParentMarking().openGroups;
                        retVal.closed = this.getParentMarking().closedGroups;
                        retVal.organisations = this.getParentMarking().organisations;
                    }
                }

                return retVal;
            },

            /**
             * Called when the marking has changed to update all the child
             * elements
             * 
             * @return
             */
            markingChanged : function()
            {
                var securityMarking = this.getSecurityMarking();

                var countObfuscated = false;
                
                if(!this.isControlSet("groups"))
                {
                    countObfuscated = true;
                }
                
                this.widgets.visibilityCount.setSecurityMarking(securityMarking);
                this.widgets.visibilityCount.setCountObfuscated(countObfuscated);
                
                this.widgets.advancedGroupSelector.setSecurityMarking(securityMarking);
                
                this.validate();
            },

            /**
             * Event handler to show the nationality marking dialog
             * 
             * @private
             * @method onNationalityClick
             * @param e
             *            the event
             */
            onNationalityClick : function(e)
            {
                if (this.hasParentMarking())
                {
                    /* If we are editing an existing item */
                    Alfresco.util.PopupManager.displayPrompt(
                        {
                            text : Alfresco.util.message(this._msg("control.nationality.cannot-change-when-editing")),
                            title : Alfresco.util.message(this._msg("control.nationality")),
                            close : true
                        });
                }
                else
                {
                    Alfresco.EnhancedSecurityNationalityMarkingSelector
                            .show(
                                {
                                    currentValue : this.getValue("nationality"),
                                    saveCallback :
                                        {
                                            fn : this.nationalityUpdatedCallback,
                                            scope : this
                                        },

                                    panelOptions :
                                        {
                                            context : [
                                                    this.id
                                                            + "-enhancedSecuritySelector-selectorContainer-editControls-nationality",
                                                    "tl", "bl", [ "beforeShow", "windowResize" ] ]
                                        }
                                });
                }

                Event.stopEvent(e);
            },

            /**
             * Event handler to show the freeform caveats dialog
             * 
             * @private
             * @method onFreeformClick
             * @param e
             *            the event
             */
            onFreeformClick : function(e)
            {
                Alfresco.EnhancedSecurityFreeformMarkingsSelector.show(
                    {
                        recentValues : [ "FREEFORM1", "FREEFORM2", "FF3 FF4" ],

                        currentValue : this.getValue("freeform"),

                        panelOptions :
                            {
                                context : [
                                        this.id + "-enhancedSecuritySelector-selectorContainer-editControls-freeform",
                                        "tl", "bl", [ "beforeShow", "windowResize" ] ]
                            },

                        saveCallback :
                            {
                                fn : this.freeformUpdatedCallback,
                                scope : this
                            }
                    });

                Event.stopEvent(e);
            },

            /**
             * Event handler to show the single value dialogs (nod,
             * classification, atomal)
             * 
             * @private
             * @method onSingleValueClick
             * @param e
             *            the event
             * @param control
             *            the name of the control
             */
            onSingleValueClick : function(e, control)
            {
                var dialog = Alfresco.util.ComponentManager.get(this.id + "-" + control + "-singleValueSelector");

                dialog
                        .show(
                            {
                                currentValue : this.getValue(control),

                                panelOptions :
                                    {
                                        context : [
                                                this.id + "-enhancedSecuritySelector-selectorContainer-editControls-"
                                                        + control, "tl", "bl", [ "beforeShow", "windowResize" ] ]
                                    },

                                saveCallback :
                                    {
                                        fn : this.singleValueUpdatedCallback,
                                        scope : this
                                    }
                            });

                Event.stopEvent(e);
            },

            /**
             * Event handler - when the groups are clicked on, open the select
             * groups dialogue
             * 
             * @private
             * @method onGroupsClick
             * @param e
             *            The event trapped
             * @method onGroupsClick
             */
            onGroupsClick : function(e)
            {
                Alfresco.EnhancedSecuritySelectorGroupsAdvancedSelector.show(
                    {
                        saveCallback :
                            {
                                fn : this.groupsUpdatedCallback,
                                scope : this
                            },
                        currentMarking : this.getSecurityMarking(),
                        controller : this,
                        startBlank : !this.isControlSet("groups")
                    });
                
                Event.stopEvent(e);
            },

            /**
             * Gets the value of a control
             * 
             * @method getValue
             * @param control
             *            the name of the control
             * @return the value of the control
             */
            getValue : function(control)
            {
                var button = this.getButtonForControl(control);

                var value = YAHOO.lang.trim(button.get("label"));

                if (Dom.hasClass(button, "blank-control")
                        || (value == this._msg("control." + control + ".none"))
                        || (value == this._msg("control." + control + ".select")))
                {
                    return "";
                }
                else
                {
                    return value;
                }
            },
            
            /**
             * Returns <code>true</code> if the control is anything other than the default "Select..."
             * i.e. the user has chosen a value.
             * 
             * @param control the control name
             * @returns {Boolean}
             */
            isControlSet : function(control)
            {
                var button = this.getButtonForControl(control);

                var value = YAHOO.lang.trim(button.get("label"));

                return (value != this._msg("control." + control + ".select"));
            },
            
            /**
             * Return the YUI button widget for a given control.
             * 
             * @param control the control name
             * @returns the Button widget
             */
            getButtonForControl : function(control)
            {
                var button = this.widgets[control + "Button"];

                if (!button)
                {
                    throw new Error("Control " + control + " not found");
                }
                
                return button;
            },
            
            saveHiddenField : function(field, value)
            {
                var match;
                
                if(field == "opengroups") {
                    match = "eslOpenGroupsHidden";
                } else if(field == "closedgroups") {
                    match = "eslClosedGroupsHidden";
                } else if(field == "organisations") {
                    match = "eslOrganisationsHidden";
                } else {
                    match = "esl-hidden-" + field;
                }
                
                var fields = YAHOO.util.Selector.query('input[id$=-' + match + ']');
                for ( var i = 0; i < fields.length; i++)
                {
                    fields[i].value = value;
                }
            },

            /**
             * Callback for the freeform caveat dialog (nod, classification,
             * atomal) save action
             * 
             * @param control
             * @param value
             * @return
             */
            freeformUpdatedCallback : function(value)
            {
                this.options.marking.freeform = value;

                this.setControl("freeform", value);

                this.saveHiddenField("freeform", value);

                this.markingChanged();
            },

            /**
             * Callback for the single value dialog (nod, classification,
             * atomal) save action
             * 
             * @param control
             * @param value
             * @return
             */
            singleValueUpdatedCallback : function(control, value)
            {
                this.options.marking[control] = value;

                this.setControl(control, value);

                this.saveHiddenField(control, value);

                // If we're editing the atomal selector, push this value into
                // the groups selector
                if (control == "atomal" && this.advancedSelector != null && this.advancedSelector.controller != null)
                {
                    this.advancedSelector.controller.setAtomalState(value);
                }

                if (control == "atomal")
                {
                    this.markingChanged();
                }

                this.markingChanged();
            },

            /**
             * Refresh allowable values, and redraw the ribbon, based on the
             * parent marking contained in the given element (which may be null)
             * 
             * @param parentMarkingContainer
             *            An element (probably a div) which either is or is an
             *            ancestor of the div containing a parent security
             *            marking
             * @method refreshAndRedraw
             */
            refreshAndRedraw : function(parentMarkingContainer)
            {
                this.hasParentItem = null; // Force recalculation of parent
                // item
                this.setParentRootNode(parentMarkingContainer);

                if (this.hasParentMarking())
                {
                    this.setCurrentMarkingToParentMarking();
                }
                else
                {
                    this.setCurrentMarkingToDefaultMarking();
                }
                this.initControls();
                this.markingChanged();
                this.showHideSavedLabelUI();
            },

            /**
             * Callback for the freeform caveat dialog (nod, classification,
             * atomal) save action
             * 
             * @param control
             * @param value
             * @return
             */
            nationalityUpdatedCallback : function(value)
            {
                this.options.marking.nationality = value;

                this.setControl("nationality", value);

                this.saveHiddenField("nationality", value);

                this.markingChanged();
            },

            /**
             * Callback injected into the "select group" dialogue to update the
             * record, and display, of currently selected groups when the
             * dialogue is exited
             * 
             * @param groups
             *            Space separated list of groups selected
             * @method groupsUpdatedCallback
             */
            groupsUpdatedCallback : function(groups)
            {
                this.options.marking.groups = groups;
                this.setControl("groups", groups);

                var groupsSplit = this.getGroupsSplit();
                
                this.saveHiddenField("opengroups", groupsSplit.open);
                this.saveHiddenField("closedgroups", groupsSplit.closed);
                this.saveHiddenField("organisations", groupsSplit.organisations);

                this.markingChanged();
            },

            isClosedGroup : function(group)
            {
                return this.isGroupInConstraint(group, "es_validClosedMarkings");
            },
            
            isOrganisationGroup : function(group)
            {
                return this.isGroupInConstraint(group, "es_validOrganisations");
            },
            
            /**
             * Is the given group a group with a certain constraint? This is currently based off
             * the group name but, as the produce matures, we should change it
             * to work from (a cache of data in) the model
             * 
             * @param group
             *            Name of a group
             * @param constraintName
             *            The name of the constraint. e.g. "es_validClosedMarkings"
             * @return True if the group is in the given constraint. False if it is not
             * (in which case it may not be a group at all)
             */
            isGroupInConstraint : function(group, constraintName)
            {
                var constraints = this.groups.constraints;
                var closedConstraint = null;
                for ( var i = 0; i < constraints.length; i++)
                {
                    if (constraints[i].constraintName == constraintName)
                    {
                        closedConstraint = constraints[i];
                        break;
                    }
                }
                // Throw an error if we couldn't find the constraint
                if (closedConstraint == null)
                {
                    throw new Error("Could not find a constraint with name: " + constraintName);
                }

                // Iterate through all the markings and return true if we
                // find one that matches the given group name
                var markings = closedConstraint.markings;
                for ( var i = 0; i < markings.length; i++)
                {
                    if (markings[i].name == group)
                    {
                        return true; // We only need to find one match, so
                        // return true now
                    }
                }
                // We didn't find a match in the list of closed groups, so
                // return false
                return false;
            },

            /**
             * Redraw every control comprising this selector
             * 
             * @method refreshDisplay
             */
            refreshDisplay : function()
            {
                this.setControl("nod", this.options.marking.nod);
                this.setControl("classification", this.options.marking.classification);
                this.setControl("atomal", this.options.marking.atomal);
                this.setControl("groups", this.options.marking.groups);
                this.setControl("freeform", this.options.marking.freeform);
                this.setControl("nationality", this.options.marking.nationality);
            },

            /**
             * Redraw a single control to display a given value. This doesn't
             * actually set the value, just redraws the control. It is up to the
             * caller to ensure that any value displayed using this method is
             * represented in the appropriate business object.
             * 
             * @param ctl
             *            Last part of the htmlid of the component to redraw
             * @param value
             *            String value to insert into the rendition of the
             *            component
             * @method setControl
             */
            setControl : function(ctl, value)
            {
                value = YAHOO.lang.trim(value);

                // Set the view control
                var element = Dom.get(this.id + "-enhancedSecuritySelector-selectorContainer-viewControls-"
                        + ctl);
                if (element)
                {
                    element.innerHTML = "";
                    element.appendChild(document.createTextNode(value));
                }

                // Set the edit control
                var button = this.widgets[ctl + "Button"];

                if (button)
                {
                    if (value == "")
                    {
                        Dom.addClass(button, "blank-control");
                        value = this._msg("control." + ctl + ".none");
                    }
                    else
                    {
                        Dom.removeClass(button, "blank-control");
                    }
                    
                    if(value == this._msg("control." + ctl + ".select")) {
                        Dom.addClass(button, "unset-control");
                    } else {
                        Dom.removeClass(button, "unset-control");
                    }

                    button.set("label", value);
                }
            },

            /**
             * Lazy-loads the list of groups from the server. Note: Always fires
             * the enhancedSecuritySelector.onGroupsLoaded event whether or not
             * the groups have already been loaded.
             * 
             * @param force
             *            {boolean} Whether to force a reload of the groups
             */
            loadGroups : function(force)
            {
                if (!force && this.groups)
                {
                    YAHOO.Bubbling.fire("enhancedSecuritySelector.onGroupsLoaded",
                        {
                            groups : this.groups,
                            cached : true
                        });
                    return;
                }

                // If we are already loading the groups, don't trigger the ajax
                // request again
                if (!this.loadingGroups)
                {
                    this.loadingGroups = true;

                    Alfresco.util.Ajax.jsonRequest(
                        {
                            url : Alfresco.constants.PROXY_URI + "enhanced-security/group-details",
                            successCallback :
                                {
                                    fn : this.groupsLoaded,
                                    scope : this
                                },
                            failureCallback :
                                {
                                    fn : this.groupsLoadFailure,
                                    scope : this
                                }
                        });
                }
            },
            
            groupsLoaded : function(response)
            {
                this.groups = response.json;
                this.loadingGroups = false;
                
                // We will revalidate as some of the validation relies on the
                // groups
                this.validate();
                
                YAHOO.Bubbling.fire("enhancedSecuritySelector.onGroupsLoaded",
                    {
                        groups : this.groups,
                        cached : false
                    });
            },
            
            groupsLoadFailure : function()
            {
                this.loadingGroups = false;
                YAHOO.Bubbling.fire("enhancedSecuritySelector.onGroupsLoadFailure");
            },

            setPermissibleVisibilityNoWiderThanParent : function()
            {
                if (this.hasParentMarking())
                {
                    var parentMarking = this.getParentMarking(true);

                    this.restrictPM(parentMarking.PM);
                    this.restrictGroups(parentMarking.closedGroups, "closed");
                    this.restrictGroups(parentMarking.openGroups, "open");
                    this.restrictGroups(parentMarking.organisations, "organisations");
                    this.restrictAtomal(parentMarking.atomal);

                    this.options.marking.groups = parentMarking.closedGroups.join(" ") + " "
                            + parentMarking.openGroups.join(" ");
                    this.setControl('groups', this.options.marking.groups);

                    if (this.advancedSelector != null)
                    {
                        this.advancedSelector.options.currentGroups = this.options.marking.groups;
                    }

                    /*
                     * Change the rendition of the nationality button. Not sure
                     * how much of a bodge this is - I want it to look disabled
                     * but still be useable.
                     */
                    Dom.addClass(this.widgets.nationalityButton, "yui-button-disabled yui-push-button-disabled");
                }
                else
                {
                    this.restrictPM("");
                    this.restrictGroups("", "open");
                    this.restrictGroups("", "closed");
                    this.restrictGroups("", "organisations");
                    this.restrictAtomal("");

                    Dom.removeClass(this.widgets.nationalityButton, "yui-button-disabled yui-push-button-disabled");
                }
            },

            /**
             * Does the item currently being edited have a parent? This is
             * currently obtained by scraping the screen. The return value is
             * cached for reuse
             * 
             * @return True if the item has a parent, false otherwise
             */
            hasParentMarking : function()
            {
                if (this.hasParentItem == null)
                {
                    var pmContainers=YAHOO.util.Selector.query('div span.eslRenderPM', this.parentRootNode);
                    this.hasParentItem = 
                        pmContainers.length > 0
                        && YAHOO.lang.trim(YAHOO.util.Selector.query('div span.eslRenderPM')[0].innerHTML).length>0;
                }
                return this.hasParentItem;
            },

            /**
             * Does the parent marking, if it exists, contain any of the
             * following values.
             * 
             * @param markingArray
             *            Array of markings (that may or may not be valid)
             * @return True if any of the input markings has been applied to the
             *         parent item, false otherwise (including if there is no
             *         parent item)
             */
            parentHasOneOf : function(markingArray)
            {
                for ( var i = 0; i < markingArray.length; i++) // iterate over
                // the items in
                // the input
                // array
                {
                    if (this.parentHasMarking(markingArray[i]))
                    {
                        return true;
                    }
                }
                return false;
            },

            /**
             * Does the parent item include this marking? We can use the hash to
             * speed this method up
             * 
             * @param marking
             *            A marking, which may or may not be a valid marking of
             *            any type - no validation is performed
             * @return True if the marking has been applied to the parent, false
             *         otherwise (including if there is no parent marking)
             */
            parentHasMarking : function(marking)
            {
                return !(this.parentGroupsHash[marking.name] == null);
            },

            restrictPM : function(minValue)
            {
                Alfresco.util.ComponentManager.get(this.id + "-classification-singleValueSelector").setMinimumLevel(
                        YAHOO.lang.trim(minValue));
            },

            /**
             * Restrict the groups in this marking by recording that the parent
             * item has the following groups. Further calls to this method are
             * additive. For performance, this method does not dedupe the
             * resulting value in the parentGroups field. It is up to consumers
             * of this field to handle the possibility that a group is recorded
             * more than once in the array. This method does, however, maintain
             * a hash lookup of presence using the parentGroupsHash field.
             * 
             * @param parentGroups
             *            Array of groups present on the parent item
             *            
             * @param groupType
             *            The group type. One of "closed", "open" or "organisations"
             */
            restrictGroups : function(parentGroups, groupType)
            {
                if (this.parentGroups == null)
                {
                    this.parentGroups = parentGroups;
                }
                else
                {
                    this.parentGroups = this.parentGroups.concat(parentGroups);
                }
                for ( var i = 0; i < parentGroups.length; i++)
                {
                    this.parentGroupsHash[parentGroups[i]] = new Object();
                }

                if (groupType == "open")
                {
                    this.advancedSelector.setParentOpenGroups(parentGroups);
                }
                else if(groupType == "closed")
                {
                    this.advancedSelector.setParentClosedGroups(parentGroups);
                }
                else
                {
                    this.advancedSelector.setParentOrganisations(parentGroups);
                }
            },

            restrictAtomal : function(minValue)
            {
                Alfresco.util.ComponentManager.get(this.id + "-atomal-singleValueSelector").setMinimumLevel(
                        YAHOO.lang.trim(minValue));
            },

            /**
             * Get an object representing the marking of the parent item,
             * assuming there is one. This method should not be called to
             * determine if there _is_ a parent item, and may throw an error if
             * there isn't TODO - cache the return value for improved
             * performance
             * 
             * @return An object with the following properties:
             *         closedGroups(array), openGroups(array), nod, PM, atomal,
             *         freeform and eyes
             */
            getParentMarking : function(force)
            {
                if (!force && this.parentMarking && this.parentMarking.PM != "")
                {
                    if (this.hasParentMarking())
                    {
                        return this.parentMarking;
                    }
                    else
                    {
                        return null;
                    }
                }

                var rootNode = this.parentRootNode;

                // If there are multiple markings on display (discussion group
                // tree), the parent item
                // is the last one
                var possibleParentCGs = YAHOO.util.Selector.query('div span.eslRenderClosed', rootNode);
                var possibleParentOGs = YAHOO.util.Selector.query('div span.eslRenderOpen', rootNode);
                var possibleParentOrganisations = YAHOO.util.Selector.query('div span.eslRenderOrganisations', rootNode);
                var possibleParentNods = YAHOO.util.Selector.query('div span.eslRenderNod', rootNode);
                var possibleParentPMs = YAHOO.util.Selector.query('div span.eslRenderPM', rootNode);
                var possibleParentAtomals = YAHOO.util.Selector.query('div span.eslRenderAtomal', rootNode);
                var possibleParentFreeforms = YAHOO.util.Selector.query('div span.eslRenderFreeForm', rootNode);
                var possibleParentEyes = YAHOO.util.Selector.query('div span.eslRenderEyes', rootNode);

                // Default to the empty string and only set those items we can
                // find a span for
                var closedGroupsOnParentStr = "";
                var openGroupsOnParentStr = "";
                var organisationsOnParentStr = "";
                var nodOnParentStr = "";
                var PMOnParentStr = "";
                var AtomalOnParentStr = "";
                var freeformOnParentStr = "";
                var eyesOnParentStr = "";

                if (possibleParentCGs.length > 0)
                {
                    closedGroupsOnParentStr = YAHOO.lang
                            .trim(possibleParentCGs[possibleParentCGs.length - 1].innerHTML);
                }

                if (possibleParentOGs.length > 0)
                {
                    openGroupsOnParentStr = YAHOO.lang.trim(possibleParentOGs[possibleParentOGs.length - 1].innerHTML);
                }
                if (possibleParentOrganisations.length > 0)
                {
                    organisationsOnParentStr = YAHOO.lang.trim(possibleParentOrganisations[possibleParentOrganisations.length - 1].innerHTML);
                }
                if (possibleParentNods.length > 0)
                {
                    nodOnParentStr = possibleParentNods[possibleParentNods.length - 1].innerHTML;
                }
                if (possibleParentPMs.length > 0)
                {
                    PMOnParentStr = possibleParentPMs[possibleParentPMs.length - 1].innerHTML;
                }
                if (possibleParentAtomals.length > 0)
                {
                    AtomalOnParentStr = possibleParentAtomals[possibleParentAtomals.length - 1].innerHTML;
                }
                if (possibleParentFreeforms.length > 0)
                {
                    freeformOnParentStr = possibleParentFreeforms[possibleParentFreeforms.length - 1].innerHTML;
                }
                if (possibleParentEyes.length > 0)
                {
                    eyesOnParentStr = possibleParentEyes[possibleParentEyes.length - 1].innerHTML;
                }
                // Create the return object and split the groups into arrays
                this.parentMarking = new Object();

                if (closedGroupsOnParentStr == "")
                {
                    /* If the closed groups is empty we output the empty array */
                    this.parentMarking.closedGroups = [];
                }
                else
                {
                    this.parentMarking.closedGroups = closedGroupsOnParentStr.replace(/\s\s+/, " ").split(" ");
                }

                if (openGroupsOnParentStr == "")
                {
                    /* If the open groups is empty we output the empty array */
                    this.parentMarking.openGroups = [];
                }
                else
                {
                    this.parentMarking.openGroups = openGroupsOnParentStr.replace(/\s\s+/, " ").split(" ");
                }

                if (organisationsOnParentStr == "")
                {
                    /* If the open groups is empty we output the empty array */
                    this.parentMarking.organisations = [];
                }
                else
                {
                    this.parentMarking.organisations = organisationsOnParentStr.replace(/\s\s+/, " ").split(" ");
                }

                this.parentMarking.nod = nodOnParentStr;
                this.parentMarking.PM = PMOnParentStr;
                this.parentMarking.atomal = AtomalOnParentStr;
                this.parentMarking.freeform = freeformOnParentStr;
                this.parentMarking.eyes = eyesOnParentStr;

                return this.parentMarking;
            },

            /**
             * Method to listen to dialogs being shown, and move the ribbon to
             * the upload dialog if it's shown.
             * 
             * @private
             * @method onPanelDisplayed
             * @param e
             *            the event name
             * @param args
             *            the event arguments
             */
            onPanelDisplayed : function(event, args)
            {
                var panel = args[1].panel;

                if (!this.isPanelEditPanel(panel))
                {
                    return true;
                }

                /* Get the instance of the file uploader */
                var fileUpload = Alfresco.getFileUploadInstance();

                /*
                 * If updateNodeRef is non-null we are updating an existing
                 * document
                 */
                if (fileUpload.showConfig.updateNodeRef)
                {
                    /* Find all the checkboxes in the document list */
                    var nodeRefInputs = YAHOO.util.Selector.query("td.yui-dt-col-nodeRef input");

                    var nodeRefInput = null;

                    /*
                     * Go through each of the inputs and see if we can find one
                     * with a value whcih matches the nodeRef
                     */
                    for ( var i in nodeRefInputs)
                    {
                        if (nodeRefInputs[i].value == fileUpload.showConfig.updateNodeRef)
                        {
                            /* We have found our suspect! */
                            nodeRefInput = nodeRefInputs[i];
                            break;
                        }
                    }

                    /* Check if we found an input with the nodeRef in it */
                    if (nodeRefInput)
                    {
                        /*
                         * Go through all the parent nodes until we find the TR
                         * which contains it
                         */
                        var parent = Dom.getAncestorByTagName(nodeRefInput, "TR");

                        if (parent)
                        {
                            this.refreshAndRedraw(parent);
                        }
                    }
                }
                else
                {
                    /*
                     * Use an element which will never contain a display marking
                     * (so we always go into creating new item mode with no
                     * restrictions)
                     */
                    this.refreshAndRedraw(this.id);
                }

                this.moveEditRibbonToElement(panel.body);

                return true;
            },

            /**
             * Method to listen to dialogs being hidden, and move the ribbon to
             * its normal place
             * 
             * @private
             * @method onPanelHidden
             * @param e
             *            the event name
             * @param args
             *            the event arguments
             */
            onPanelHidden : function(event, args)
            {
                var panel = args[1].panel;

                if (!this.isPanelEditPanel(panel))
                {
                    return true;
                }

                this.resetEditRibbonPosition();

                /*
                 * This is commented out to fix issue INT-210. It will, however,
                 * cause problems if we reinstate the view ribbon as the chosen
                 * marking will not be reset when the panel is hidden
                 */
                // this.refreshAndRedraw(null);
                return true;
            },

            /**
             * Moves the edit ribbon to be the first child of the given element.
             * 
             * @private
             * @method addEditRibbonToElement
             * @param element
             *            the element to which to add the edit ribbon
             */
            moveEditRibbonToElement : function(element)
            {
                var editRibbonElement = Dom.get(this.id + "-enhancedSecuritySelector");

                this.wasInEditMode = editRibbonElement.style.display == "";

                Alfresco.EnhancedSecuritySelector.toViewMode();

                element.insertBefore(editRibbonElement, element.firstChild);

                editRibbonElement.style.display = "";
                
                this.widgets.ribbonMessages.removeAllMessages();
                
                this.validate();
                
                this.cacheSavedLabel();
                this.initSavedLabelUI();
            },

            /**
             * Moves the edit ribbon back to its normal position in the DOM.
             * 
             * @private
             * @method resetEditRibbonPosition
             */
            resetEditRibbonPosition : function()
            {
                var editRibbonElement = Dom.get(this.id + "-enhancedSecuritySelector");
                var outerRibbonElement = Dom.get(this.id + "-enhancedSecuritySelectorOuter");

                outerRibbonElement.appendChild(editRibbonElement);

                if (this.wasInEditMode)
                {
                    Alfresco.EnhancedSecuritySelector.toEditMode();
                }
                else
                {
                    Alfresco.EnhancedSecuritySelector.toViewMode();
                }
            },

            /**
             * Determines whether a panel is one we care about. If it is then
             * the edit ribbon will be moved to it when it is displayed.
             * 
             * @private
             * @method isPanelEditPanel
             * @param panel
             *            the panel div
             * @return true if it's an edit panel, false otherwise
             */
            isPanelEditPanel : function(panel)
            {
                var panelElement = panel.element.firstChild;
                if (Dom.hasClass(panelElement, "html-upload") || Dom.hasClass(panelElement, "flash-upload"))
                {
                    /* It's an upload form */
                    return true;
                }

                return false;
            },

            /**
             * Listener callback which will be called before the discussion
             * reply form is shown. This will move the edit ribbon into the
             * form.
             * 
             * @private
             * @method onBeforeShowDiscussionReplyForm
             * @param e
             *            the event name
             * @param args
             *            the event arguments
             */
            onBeforeShowDiscussionReplyForm : function(e, args)
            {
                var obj = args[1];

                this.initControls();

                /*
                 * If we are adding a new reply obj.viewDiv will be null. If
                 * we're editing a reply obj.viewDiv will be not null.
                 */
                var parent = obj.viewDiv;

                if (parent == null)
                {
                    /*
                     * We're doing a new reply. Work out if we're replying to
                     * the main topic or another reply
                     */
                    if (obj.formDiv.parentNode.id.match(/replies-root$/))
                    {
                        /*
                         * The parentNode id ends with "replies-root" - We're
                         * replying to the original topic. Get me the first
                         * topic view on the page
                         */
                        parent = YAHOO.util.Selector.query(".node.topic.topicview", "bd", true);
                    }
                    else
                    {
                        /*
                         * We're replying to a reply - narrow the search to the
                         * first child node
                         */
                        parent = obj.formDiv.parentNode.firstChild;
                    }
                }

                this.refreshAndRedraw(parent);
                this.moveEditRibbonToElement(YAHOO.util.Selector.query("form", obj.formDiv, true));
            },

            /**
             * Listener callback which will be called after the discussion reply
             * form is hidden. This will reset the edit panel back to the normal
             * place.
             * 
             * @private
             * @method onAfterHideDiscussionReplyForm
             * @param e
             *            the event name
             * @param args
             *            the event arguments
             */
            onAfterHideDiscussionReplyForm : function(e, args)
            {
                this.resetEditRibbonPosition();
                this.refreshAndRedraw(null);
            },

            /**
             * Listener callback which will be called after the discussion
             * replies have been rendered
             * 
             * @private
             * @method onAfterRenderDiscussionReplies
             * @param e
             *            the event name
             */
            onAfterRenderDiscussionReplies : function(e)
            {
                this.setParentRootNode(null);
                this.setCurrentMarkingToParentMarking();
                this.initControls();
            },
            
            /**
             * Enable the 'commit' (AKA Save, edit, Submit etc) button, or show a fake,
             * permenantly disabled button instead.  TODO:  Use the client-side validation
             * inside Alfresco properley
             * @param enable Evaluates to the boolean 'true' if  we are to enable the commit button, or
             * 'false' if we are to disable it
             */
            enableCommitButton : function(enable)
            {
                var realButtons = YAHOO.util.Selector.query('span.eslSubmitContainer');
                var dummyButtons = YAHOO.util.Selector.query('span.eslSubmitForbiddenContainer');
                //The real buttons
                for (i = 0; i < realButtons.length; i++)
                {
                	if (enable)
                	{
                      realButtons[i].style.cssText = "";
                	}
                	else
                	{
                	  realButtons[i].style.cssText = "display:none;";
                	}
                }
                //The dummy buttons
                for (i = 0; i < dummyButtons.length; i++)
                {
                	if (enable)
                	{
                      dummyButtons[i].style.cssText = "display:none;";
                	}
                	else
                	{
                      dummyButtons[i].style.cssText = "";
                	}
                }
            },
            
            /**
             * Carries out validation to ensure that at least one group is selected if
             * atomal2 is selected.
             */
            validateAtomalGroups : function()
            {
            	var atomal = this.getValue("atomal");
            	var groups = this.getValue("groups").split(" ");
            	
            	if(!this.groups || !this.isControlSet("atomal") || !this.isControlSet("groups")) {
                    this.widgets.ribbonMessages.removeMessage("error.atomal-without-groups-or-organisations");
                    this.widgets.ribbonMessages.removeMessage("error.atomal-without-groups-must");
            	    return true;
            	}

                var enums = Alfresco.EnhancedSecurityStaticData.getConstants().getEnumerations();
                var atomals = enums.atomal;

            	if(Alfresco.EnhancedSecurityLogic.doGroupsSatisfyAtomal(this.groups, atomal, groups)) {
                    this.widgets.ribbonMessages.removeMessage("error.atomal-without-groups-or-organisations");
                    this.widgets.ribbonMessages.removeMessage("error.atomal-without-groups-must");
                    return true;
                } else if(atomals[1] == atomal) {
                    this.widgets.ribbonMessages.removeMessage("error.atomal-without-groups-must");
                    this.widgets.ribbonMessages.addMessage("error.atomal-without-groups-or-organisations", "error", this._msg("error.atomal-without-groups-or-organisations", atomal));
                    return false;
                } else {
                    this.widgets.ribbonMessages.removeMessage("error.atomal-without-groups-or-organisations");
                    this.widgets.ribbonMessages.addMessage("error.atomal-without-groups-must", "error", this._msg("error.atomal-without-groups-must", atomal));
                    return false;
                }
            },
            
            /**
             * Make sure all the controls have something selected
             */
            validateAllControlsSelected : function()
            {
                var invalid = false;
                
                for(var i in this.controlNames) {
                    if(!this.isControlSet(this.controlNames[i])) {
                        invalid = true;
                    }
                }
                
                if(invalid) {
                    this.widgets.ribbonMessages.addMessage("needs_selection", "info", this._msg("error.needs-selection-from-all-controls"));
                    return false;
                } else {
                    this.widgets.ribbonMessages.removeMessage("needs_selection");
                    return true;
                }
            },
            
            /**
             * Carries out validation on the label and updates the UI as appropriate.
             * @method validate
             */
            validate : function()
            {
                var valid = true;
                
                valid = this.validateAtomalGroups() && valid;
                
                valid = this.validateAllControlsSelected() && valid;

                this.isValid = valid;

                var typeCounts = this.widgets.ribbonMessages.getMessageTypeCounts();
                
                var backColour = null;
                
                if(typeCounts.error > 0) {
                    backColour = "#ffcccc";
                } else if(typeCounts.warn > 0) {
                    backColour = "#ffffcc";
                }
                
                if(backColour != this.lastBackgroundColour) {
                    if(backColour == null) {
                        // Get the background colour of the parent element
                        var outColor = this.getBackgroundColour(Dom.get(this.id + "-enhancedSecuritySelector").parentNode);
    
                        Alfresco.util.Anim.pulse(this.id + "-enhancedSecuritySelector", {
                            outColor: outColor,
                            clearOnComplete: true,
                            outDuration: 0.5
                        });
                    } else {
                        Alfresco.util.Anim.pulse(this.id + "-enhancedSecuritySelector", {
                            outColor: backColour,
                            clearOnComplete: false,
                            outDuration: 0.5
                        });
                    }
                    
                    this.lastBackgroundColour = backColour;
                }
                
                // If it's valid and we're not editing an item then we will save the current label
                if(valid && !this.hasParentMarking()) {
                    this.saveLabel();
                }
                
                this.enableCommitButton(valid);
            },
            
            /**
             * Gets the background colour of an element (traversing up the parent nodes to find it) 
             */
            getBackgroundColour : function(el)
            {
                var currentNode = el;
                var colour;
                
                do {
                    colour = YUIDom.getStyle(el, "backgroundColor");
                    if((colour != "") && (colour != "transparent") &&
                            (!colour.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)/))) {
                        return YUIDom.Color.toHex(colour);
                    }
                } while(el = el.parentNode);
                
                return "#ffffff";
            },

            /**
             * Stores the current label in a cookie. This method shouldn't be used
             * if the label is not valid
             */
            saveLabel : function()
            {
                var control, value;
                
                for(var i in this.controlNames) {
                    control = this.controlNames[i];

                    this.saveFieldValue(control, this.getValue(control));
                }
            },
            
            /**
             * Sets the controls to their stored values.
             */
            loadLabel : function()
            {
                var control, value;
                
                for(var i in this.controlNames) {
                    control = this.controlNames[i];
                    
                    var value;
                    
                    if(this.lastSavedLabel && (this.lastSavedLabel[control] !== null)) {
                        value = this.lastSavedLabel[control];
                    } else {
                        value = this._msg("control." + control + ".select");
                    }
                    
                    this.setControl(control, value);
                }
                
                this.initControls();
                
                // Get the background colour of the parent element
                var outColor = this.getBackgroundColour(Dom.get(this.id + "-enhancedSecuritySelector").parentNode);

                Alfresco.util.Anim.pulse(this.id + "-enhancedSecuritySelector", {
                    outDuration: 0.5,
                    callback: { fn: this.validate(), scope: this },
                    outColor: outColor,
                    clearOnComplete: true
                });
                
                this.markingChanged();
            },
            
            /**
             * Called on page load to cache the saved label. This is so that when the user presses the load button
             * the saved label as it was on page load will be used (rather than one that may have been saved since)
             */
            cacheSavedLabel : function()
            {
               var control, value, label = [];
               
               this.lastSavedLabel = null;
                
               for(var i in this.controlNames) {
                    control = this.controlNames[i];
                    
                    value = this.loadFieldValue(control);
                    
                    // If any of the fields are unset then we say there is no saved label
                    if(value === null) {
                        return;
                    }
                    
                    label[control] = value;
                }
                
                this.lastSavedLabel = label;
            },
            
            /**
             * Saves a field value into the cookies
             * 
             * @private
             * @method saveFieldValue
             * @param name the field name
             * @param value the value to save
             */
            saveFieldValue : function(name, value)
            {
                var cookieName = Alfresco.EnhancedSecuritySelector.COOKIE_PREFIX + name;
                
                // IE6 doesn't like cookie values of ""
                if (value == "")
                {
                    value = Alfresco.EnhancedSecuritySelector.COOKIE_EMPTY_STRING_DESIGNATOR;
                }

                YAHOO.util.Cookie.set(cookieName, value,
                    {
                        path : Alfresco.constants.URL_CONTEXT
                    });
            },

            /**
             * Loads a saved field value out of the cookies
             * 
             * @private
             * @method loadFieldValue
             * @param name the control name
             * @returns string the value, or <code>null</code> if it's not defined
             */
            loadFieldValue : function(name)
            {
                var cookieName = Alfresco.EnhancedSecuritySelector.COOKIE_PREFIX + name;

                var cookieString = document.cookie;
                cookies = cookieString.split(";");
                for ( var i = 0; i < cookies.length; i++)
                {
                    var cookieObj = cookies[i].split("=");
                    if (YAHOO.lang.trim(cookieObj[0]) == cookieName)
                    {
                        var cookieValue = unescape(YAHOO.lang.trim(cookieObj[1]));

                        // If the cookie isn't set (In IE6, this means name=value)...
                        if (cookieValue == "" || cookieValue == cookieName)
                        {
                            return null;
                        }
                        else if (cookieValue == Alfresco.EnhancedSecuritySelector.COOKIE_EMPTY_STRING_DESIGNATOR)
                        {
                            return "";
                        }
                        else
                        {
                            return cookieValue;
                        }
                    }
                }
                return null;

            },
            
            /**
             * Sets up the saved label UI - e.g. updating button tooltip etc.
             * 
             * @private
             * @method initSavedLabelUI
             */
            initSavedLabelUI : function()
            {
                if(this.lastSavedLabel) {
                    var labelArray = [];
                    
                    for(var i in this.lastSavedLabel) {
                        labelArray.push(this.lastSavedLabel[i]);
                    }
                    
                    var labelString = labelArray.join(" ").replace(/\s+/g, " ");
                    
                    Dom.setAttribute(this.id + "-enhancedSecuritySelector-lastMarkingButton",
                            "title", this._msg("label.last-marking", labelString));
                    
                    this.widgets.savedLabelTooltip = new YAHOO.widget.Tooltip(this.id + "-savedLabelTooltip", { 
                        context: this.id + "-enhancedSecuritySelector-lastMarkingButton",
                        showDelay: 0,
                        width: "20em",
                        container: this.id + "-enhancedSecuritySelector"
                    });
                    
                    Dom.setStyle(this.id + "-savedLabelTooltip", "z-index", "1000");
                    Dom.addClass(this.id + "-savedLabelTooltip", "esl-tooltip");

                    
                    this.widgets.savedLabelTooltip.contextMouseOverEvent.subscribe(function(
                            context)
                    {
                        Dom.setStyle(this.id + "-savedLabelTooltip", "display", "block");
                    }, this, true);

                    this.widgets.savedLabelTooltip.contextMouseOutEvent.subscribe(function(
                            context)
                    {
                        Dom.setStyle(this.id + "-savedLabelTooltip", "display", "none");
                    }, this, true);
                }

                this.showHideSavedLabelUI();
            },
            
            /**
             * Shows or hides the "last marking" ui as appropriate. The logic is that the ui is displayed
             * if we have a saved marking and don't have a parent marking.
             * 
             * @private
             * @method showHideSavedLabelUI
             */
            showHideSavedLabelUI : function()
            {
                if((this.lastSavedLabel == null) || this.hasParentMarking()) {
                    Dom.addClass(this.id + "-enhancedSecuritySelector-quickMarksContainer", "hidden");
                } else {
                    Dom.removeClass(this.id + "-enhancedSecuritySelector-quickMarksContainer", "hidden");
                }
            },
            
            /**
             * Initialises the ui and events for the focus slider which will show/hide the messages
             * depending on whether the focus or mouse pointer are inside the selector.
             * 
             * @private
             * @method initFocusSlider
             */
            initFocusSlider : function()
            {
                if(!this.focusSlider.clippingDiv) {
                    this.focusSlider.clippingDiv = document.createElement("div");
                    Dom.setStyle(this.focusSlider.clippingDiv, "height", "0px");
                    Dom.setStyle(this.focusSlider.clippingDiv, "overflow", "hidden");
    
                    var sliderEl = Dom.get(this.id + "-enhancedSecuritySelector-focusSlider");
    
                    sliderEl.parentNode.replaceChild(this.focusSlider.clippingDiv, sliderEl);
    
                    this.focusSlider.clippingDiv.appendChild(sliderEl);
                }
                
                Event.on(this.id + "-enhancedSecuritySelector", "mouseenter", this.showFocusSlider, this, true);
                Event.on(this.id + "-enhancedSecuritySelector", "focusin", this.showFocusSlider, this, true);
                Event.on(this.id + "-enhancedSecuritySelector", "mouseleave", this.hideFocusSlider, this, true);
                Event.on(this.id + "-enhancedSecuritySelector", "focusout", this.hideFocusSlider, this, true);
            },
            
            /**
             * Shows the "focus slider" panel.
             * 
             * @private
             * @method showFocusSlider
             */
            showFocusSlider : function()
            {
                // If the hide timeout is already going, clear it
                if(this.focusSlider.timeout) {
                    window.clearTimeout(this.focusSlider.timeout);
                }

                // We delay showing it by 500ms in case the user
                // is just transiently moving their mouse over the area
                
                var thisObj = this;
                
                this.focusSlider.timeout = window.setTimeout(function() {
                    // If we're already animating, then stop
                    if (thisObj.focusSlider.animation) {
                        thisObj.focusSlider.animation.stop(false);
                    }
                    
                    var endSize = Dom.getRegion(thisObj.id + "-enhancedSecuritySelector-focusSlider");
                    var endHeight = endSize.bottom - endSize.top;
                    
                    thisObj.animateFocusSlider(endHeight, true);
                }, 500);                        
            },
            
            /**
             * Hide the "focus slider" panel.
             * 
             * @private
             * @method hideFocusSlider
             */
            hideFocusSlider : function()
            {
                // If the hide timeout is already going, clear it
                if(this.focusSlider.timeout) {
                    window.clearTimeout(this.focusSlider.timeout);
                }
                
                var thisObj = this;
                
                this.focusSlider.timeout = window.setTimeout(function() {
                    // If we're already animating, then stop
                    if (thisObj.focusSlider.animation) {
                        thisObj.focusSlider.animation.stop(false);
                    }

                    thisObj.animateFocusSlider(0, false);
                }, 5000);
            },
            
            /**
             * Animates the focus slider
             * 
             * @private
             * @method animateFocusSlider
             * @param int endHeight the number of pixels high the div should transition to.
             * @param boolean autoOnFinish if <code>true</code> the height will be set to "auto" once the transition is complete.
             */
            animateFocusSlider : function(endHeight, autoOnFinish) {
                var startSize = Dom.getRegion(this.focusSlider.clippingDiv);
                var startHeight = startSize.bottom - startSize.top;
                
                // Set up and run the animation
                this.focusSlider.animation = new YAHOO.util.Anim(this.focusSlider.clippingDiv);
                this.focusSlider.animation.attributes.height = {
                    from : startHeight,
                    to : endHeight
                };
                this.focusSlider.animation.duration = 0.3;
                this.focusSlider.animation.method = YAHOO.util.Easing.easeOut;
                this.focusSlider.animation.onComplete.subscribe(function()
                {
                    this.focusSlider.animation = null;
                    
                    if(autoOnFinish) {
                        Dom.setStyle(this.focusSlider.clippingDiv, "height", "auto");
                    }
                }, this, true);

                this.focusSlider.animation.animate();
            },
            
            /**
             * Gets a custom message
             * 
             * @method _msg
             * @param messageId
             *            {string} The messageId to retrieve
             * @return {string} The custom message
             * @private
             */
            _msg : function EnhancedSecuritySelectorGroupsAdvancedSelector_msg(messageId)
            {
                return Alfresco.util.message.call(this, messageId,
                        "Alfresco.EnhancedSecuritySelectorGroupsAdvancedSelector", Array.prototype.slice
                                .call(arguments).slice(1));
            }
        };
})();
