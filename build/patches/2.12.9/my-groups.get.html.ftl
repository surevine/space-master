<!--
    Copyright (C) 2008-2010 Surevine Limited.
      
    Although intended for deployment and use alongside Alfresco this module should
    be considered 'Not a Contribution' as defined in Alfresco'sstandard contribution agreement, see
    http://www.alfresco.org/resource/AlfrescoContributionAgreementv2.pdf
    
    This program is free software; you can redistribute it and/or
    modify it under the terms of the GNU General Public License
    as published by the Free Software Foundation; either version 2
    of the License, or (at your option) any later version.
    
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    
    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
-->
<script type="text/javascript">//<![CDATA[

//IE-friendly version
function getElementsByClassName(node, classname) {
    var a = [];
    var re = new RegExp('(^| )'+classname+'( |$)');
    var els = node.getElementsByTagName("*");
    for(var i=0,j=els.length; i<j; i++)
        if(re.test(els[i].className))a.push(els[i]);
    return a;
}

function loadVisibilityReport()
{

  Alfresco.util.Ajax.request(
    {
      url: Alfresco.constants.PROXY_URI + "/api/enhanced-security/shared-visibility-report",
      method: "GET",
      responseContentType : "text/json",
      successCallback:
    {
      fn: onVisibilityReportSuccess,
      scope: this
    },
    failureCallback:
    {
      fn: onVisibilityReportFail,
      scope: this
    }
  });

}

function VisibilityReport_renderMembersOfGroup(groupDefinition) {
    var rV="";
    if (groupDefinition.members.length==0) {
        if (groupDefinition.name=="Any of my Groups") {
            rV="<div class='mygroups-row detail-list-item mygroups-info'> There are no other users with your security groups</div>";
        }
        else {
            rV="<div class='mygroups-row detail-list-item mygroups-info'> There are no other users with the <a href='/share/page/site/corporate/wiki-page?title=Security_Group_"+groupDefinition.name+"'>"+groupDefinition.name+"</a> group</div>";
        }
    }
    else {
        if (groupDefinition.name!="Any of my Groups" && groupDefinition.name!="Users with no security groups") {
            rV=rV+"<div class='mrgroups-group-detail-row'> The following users also have access to the <a href='/share/page/site/corporate/wiki-page?title=Security_Group_"+groupDefinition.name+"'>"+groupDefinition.name+"</a> group</div>";
        }
    }
    return rV;
}

function loadVisibilityTab(tabIndex, start, size) {
            var tab = YAHOO.util.Selector.query('div#my-groups-dashlet-body div.yui-content > div')[tabIndex];
            var groupDefinition = com_surevine_visibilityReportResults.groupDefinitions[tabIndex];
            if (groupDefinition.loadedAll || groupDefinition.loaded > (start+size)) {
                return;
            }
            
            if (start === 0) {
            	tab.innerHTML = VisibilityReport_renderMembersOfGroup(groupDefinition);
            }
            
            var showMores = getElementsByClassName(tab, 'show-more');
            
            for (showMore in showMores) {
                showMores[showMore].style.cssText="display:none;";
            }
            
            var itemsRendered=0;
            var itemsObserved=0;
            var rV="";
            
            for (member in groupDefinition.members) {
                if (++itemsObserved > start) {
                    var user=YAHOO.lang.JSON.parse(groupDefinition.members[member]);
                    var userName=user.name;
                    rV=rV+"<div class='mygroups-row detail-list-item'>";
                    rV=rV+"<div class='mygroups-icon'><a href='/share/page/user/"+userName+"/profile'><img src='/share/proxy/alfresco/sv-theme/user-profile/avatar?user="+userName+"&size=smallAvatar' alt='"+user.fullName+"'/></a></div>";
                    rV=rV+Alfresco.thirdparty.presence.getPresenceIndicatorHtml(userName,user.fullName,{"availability":user.availability,"serviceEnabled":user.enabled,"host": user.host});
                    if (user.status && user.status.length>0 && user.status !== 'Unavailable') {
                        rV=rV+"<div class='status'>"+user.status+"</div>";
                    }
                    rV=rV+"</div>";
                    if (++itemsRendered > size) {
                        break;
                    }
                }
            }
            if (start+itemsRendered < groupDefinition.members.length) {
                rV+="<div class='mygroups-row detail-list-item show-more'><a class='theme-color-1' style='font-weight:bold;' href='#' onClick='loadVisibilityTab("+tabIndex+", "+(start+size+1)+",100)'>Show More</a></div>";
            }
            else {
                groupDefinition.loadedAll=true;
            }
            groupDefinition.loaded=start+size;      
            tab.innerHTML+=rV;
}
         
function onVisibilityReportFail(response) {
    var body = YAHOO.util.Selector.query('div[id=my-groups-dashlet-body]')[0];
    body.innerHTML="<h3>Could not load details of the current users' groups.  If this issue persists, please contact support</h3>";
}
         
function onVisibilityReportSuccess(response) {
    var report = YAHOO.lang.JSON.parse(response.serverResponse.responseText);
    var reportObj = new VisibilityReport("my-groups-dashlet-body");
    com_surevine_visibilityReportResults=reportObj; //Store the results for later use
    for (group in report) {
       reportObj.addTabForGroup({"name":group, "members":report[group]});
    }
}

function handleActiveTabChange(event) {
   var activeTab=event.newValue._configs.contentEl.value;
   var tabs = YAHOO.util.Selector.query('div#my-groups-dashlet-body div.yui-content > div');
   for (tabIndex in tabs) {
        if (tabs[tabIndex]===activeTab) {
            loadVisibilityTab(tabIndex, 0, 12);
            break;
        }
   }
}

(function()
{
    VisibilityReport = function(containerId)
        {
            this.name = "VisibilityReport";
            this.id = containerId;
            this.options = {};
            this.groupDefinitions=[];
            
            /* Load YUI Components */
            Alfresco.util.YUILoaderHelper.require(["tabview"], this.onComponentsLoaded, this);
            return this;
            
        };
    VisibilityReport.prototype= {
        addTabForGroup: function VisibilityReport_addTabForGroup(group) {
            this.groupDefinitions.push(group);
        },
        render: function VisibilityReport_render() {
            this.groupDefinitions.sort(function(a,b) { return YAHOO.util.Sort.compare(a.name,b.name);});
            var tabView = new YAHOO.widget.TabView();
            for (group in this.groupDefinitions) {
                tabView.addTab( new YAHOO.widget.Tab({
                    label: this.groupDefinitions[group].name,
                    content: this.renderMembersOfGroup(this.groupDefinitions[group])
                }));
            }
            tabView.set('activeIndex', 0);
            tabView.addListener('activeTabChange', handleActiveTabChange);
            tabView.appendTo(document.getElementById(this.id));
            
            //If we have more than three groups, use a more compact rendering scheme
            if (this.groupDefinitions.length>3) {
                //Remove the default tab selection mechanism
                var parentUl = YAHOO.util.Selector.query('div#my-groups-dashlet-body div ul.yui-nav')[0];
                var children = YAHOO.util.Selector.query('div#my-groups-dashlet-body div ul.yui-nav li');
                for (var i=0; i < children.length; i++) {
                    parentUl.removeChild(children[i]);
                }
       
                //Add our new control
                var newControl="<span>Show the members of: </span><select id='my-groups-select'>";
                for (group in this.groupDefinitions) {
                    newControl+="<option value='"+this.groupDefinitions[group].name+"'>"+this.groupDefinitions[group].name+"</option>";
                }
                newControl+="</select>";
                parentUl.innerHTML=newControl;
                
                //Add the event handler to make the select dialogue function as per the tab buttons
                var selector = document.getElementById("my-groups-select");
                selector.onchange=function() {
                    var tabs = YAHOO.util.Selector.query('div#my-groups-dashlet-body div.yui-content > div');
                    for (var i=0; i < tabs.length; i++) {
                        if (i==this.selectedIndex) {
                            tabs[i].className="";
                            loadVisibilityTab(i, 0, 12);
                        }
                        else {
                            tabs[i].className="yui-hidden";
                        }
                    }
                }
                
            }
            loadVisibilityTab(0, 0, 12);
        },
        onComponentsLoaded: function VisibilityReport_onComponentsLoaded() {
                this.render();
        },
        renderMembersOfGroup: VisibilityReport_renderMembersOfGroup
    }
}
)
();

Alfresco.util.YUILoaderHelper.require(["tabview"], loadVisibilityReport, new Object());
//]]></script>

<script type="text/javascript">//<![CDATA[
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
//]]></script>
<div class="dashlet">
   <div class="title">People in My Groups</div>
   <div id="my-groups-dashlet-body" class="body scrollableList mygroups-box" <#if args.height??>style="height: ${args.height}px;"</#if>>
   </div>
</div>
