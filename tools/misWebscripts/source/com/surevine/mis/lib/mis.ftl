<#macro dateFormat date>${date?string("'\"'dd MMM yyyy HH:mm:ss 'GMT'Z '('zzz')'\"")}</#macro>


<#macro getUrl item>
<#if item.node.displayPath?contains("documentLibrary")>
<#if item.node.type=="{http://www.alfresco.org/model/content/1.0}folder">
page/site/<@getSite item.node/>/folder-details?nodeRef=${item.node.nodeRef}
<#else>
page/site/<@getSite item.node/>/document-details?nodeRef=${item.node.nodeRef}
</#if>
<#elseif item.node.displayPath?contains("wiki")>
page/site/<@getSite item.node/>/wiki-page?title=${item.node.properties["cm:name"]?url}
<#elseif item.node.displayPath?contains("discussions")>
page/site/<@getSite item.node/>/discussions-topicview?container=discussions&topicId=<@getTopic item.node/>&listViewLinkBack=true
<#else>
.
</#if>
</#macro>

<#macro getType item>
  <#if item.node.displayPath?contains("documentLibrary")>
    <#if item.node.type=="{http://www.alfresco.org/model/content/1.0}folder">
      Folder
    <#else>
      Document
    </#if>
  <#elseif item.node.displayPath?contains("wiki")>
    Wiki Page
  <#elseif item.node.displayPath?contains("discussions")>
    Discussion
  <#else>
    Unknown
  </#if>
</#macro>

<#macro getName item>
  <#if item.type='{http://www.alfresco.org/model/forum/1.0}topic'>
    ${item.children[0].properties["cm:title"]}
  <#elseif item.type='{http://www.alfresco.org/model/forum/1.0}post'>
   <@getName item.parent/>
  <#else>
    ${item.properties["cm:name"]}
  </#if>
</#macro>

<#-- lack of spcaing needed to format url correctly-->
<#-- Recursivley navigate up the post tree until we find the topic node, and link to that-->
<#macro getTopic post><#if post.type='{http://www.alfresco.org/model/forum/1.0}topic'>${post.properties["cm:name"]}<#else><@getTopic post.parent/></#if></#macro>

<#-- As above, return the site the user is in-->
<#macro getSite item><#if item.type='{http://www.alfresco.org/model/site/1.0}site'>${item.properties["cm:name"]}<#else><@getSite item.parent/></#if></#macro>

<#macro htmlResultsTable results>
  <#if results?size == 0>
    <div class="detail-list-item first-item last-item">
      <span>No items were found for the specified criteria</span>
    </div>
  <#else>
    <p>${results?size} items were found</p>
    <table class='mis' border='1' cellpadding='10' cellspacing='0'>
      <tr class='header'>
          <th>ID</th>
          <th>Title</th>
          <th>Type</th>
          <th>Site</th>
          <th>Path</th>
          <th>Last modified</th>
          <th>Node Details</th>
      </tr>

      <#list results as item>
        <tr class='result'>
          <td>${item.id}</td>
          <td><a href='/share/<@getUrl item/>' target='_new'> <@getName item.node/></a></td>
          <td><@getType item/></td>
          <td><@getSite item.node/></td>
          <td>${item.node.displayPath}</td>
          <td>${item.modTime?string("dd MMM, yyyy HH:mm:ss")}</td>
          <td>${item.node}</td>
      </#list>

      </table>

    </#if>
</#macro>