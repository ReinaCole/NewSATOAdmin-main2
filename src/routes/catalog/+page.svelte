<script>
	import { text } from "@sveltejs/kit";

  
let activeTab="catalog";
let entries = [];
let componentName = "";
let description = "";


function goTo(path) { 
  window.location.href = path;
}   

function addEntry() {
  entries = [
    ...entries,
    { name: componentName,
      description: description
    }    
  ];

  componentName = "";
  description = ""; 
  }

  function editEntry(index){
    entries[index].editing = true;
    entries = [...entries]
  }

  function saveEntry(index){
  entries[index].editing = false;
  entries = [...entries];
}

  function deleteEntry(index){
    entries = entries.filter ((_, i) => i !== index);
  }

</script>


<div class="catalog-container">
 <h1>ADMIN CATALOG</h1>

  <div class="button-group">

 <button class="logout-button"class:active={activeTab === "logout"}
 on:click= {() => goTo("/")}>
  LOG OUT</button>

 <button class="library-button" class:active={activeTab === "library"}
 on:click= {() => goTo("library")}>
 LIBRARY</button>


 <button class="catalog-button" class:active={activeTab === "catalog"}
 on:click= {() => goTo("catalog")}> 
 CATALOG</button>

   </div>

</div>

<!--  input box ng name and decription para maka type -->  

<div class="catalog-component-box">

 <input type="text" placeholder="Component Name..." class="component-name-input"
 bind:value={componentName}/>
 <input type="text" placeholder="Description..." class="description-input"
 bind:value={description}/>

 <button class="add-button" on:click={addEntry}>ADD</button>

</div>

<!--title lng-->

<div class="title">
  <div class="name-title"> Name:</div>
  <div class="description-title"> Description:</div>
</div>

<!--entries display and para maedit and madelte ung entries-->

{#each entries as entry,i}
<div class="catalog-entry-box">

{#if entry.editing}

 <input class="name_edit" bind:value={entry.name}
 on:input={() => (entries = [...entries])}/>

<textarea class="description_edit" bind:value={entry.description}
on:input={() => (entries = [...entries])}></textarea>

<button class="save_button" on:click={() => saveEntry(i)}>Save</button>

{:else}

  <div class="name-entry">{entry.name}</div>
  <div class="description-entry">{entry.description} </div>

  <button class="edit_button_input" on:click={() => editEntry(i)}>
    <img src="/write.svg" alt="edit" class="edit" /> </button>
  
    <button class="delete_button_input" on:click={() => deleteEntry(i)}>
    <img src="/delete.svg" alt="delete" class="delete" /> </button>

{/if}

</div>
{/each}

<style>

:global(body) {
  background-color: #19333c;
  margin: 0;
  padding: 0;
  color: #fff;
  font-family: sans-serif;
}

.catalog-entry-box{
  display: flex;
  gap: 10px;
  padding: 20px;
  margin-top: 5px; 
  
} 

.name-entry{
background-color: #000000;
  padding: 10px;
  border-radius: 10px;
  border-color: #3E92B5;
  border-width: 2px;
  color: #CF8C44;
  border-style: solid;

}

.description-entry{
background-color: #000000;
  padding: 10px;
  border-radius: 10px;
  border-color: #3E92B5;
  border-width: 2px;
  color: #CF8C44;
  border-style: solid;
  
}

.title {
  display: flex;
  gap: 0px;
  padding: 20px;
  margin-top: 5px; 
} 

.name-title {
  flex: 1;
  max-width: 150px;
  font-weight: bold;
  color:#CF8C44;

}

.description-title {
  flex: 3;
  color:#CF8C44;
  font-weight: bold;
}

:global(.button-group) {
  display: flex;
  gap: 10px;
  margin-left: auto; 
  padding: 0 20px;
  height: 50px;
}

:global(.library-button){
background-color: #3E92B5;
color: #fff;
border-radius: 10px;
max-width: 100px;
padding: 6px 10px;
border-color: #3E92B5;
border-width: 5px;
}

:global(.catalog-button){
background-color:  #CF8C44;
color: #fff;
border-radius: 10px;
max-width: 100px;
padding: 6px 10px;
border-color: #3E92B5;
border-width: 5px;
}

:global(.logout-button){
background-color: #b50b0b;
color: #fff;
border-radius: 10px;
max-width: 100px;
padding: 6px 10px;
border-color: #841f03;
border-width: 5px;
}

.catalog-container {
  background-color: #000000;
  height: 80px;
  width: auto;               /* let width be determined by margins */
  max-width: 2000px;         /* optional: limit maximum width */
  margin: 10px 15px 0 15px;  /* top 10px, left/right 15px, bottom 0 */
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 20px;           /* space inside header for text */
  position: fixed;
  top: 0;
  left: 0;                    /* stays at top-left */
  right: 0;                   /* ensures it stops at right margin */
  z-index: 1000;
  color: #CF8C44;
  font-size: 24px;
  font-weight: bold;
  border-radius: 20px;
  border: 1px solid #3E92B5;
}


.catalog-component-box {
     display: flex;
     gap: 10px;
     padding: 20px;
     margin-top: 100px; 
      height: 50px;
}

.component-name-input{
flex: 1;
max-width: 150px;
padding: 6px 10px;
background-color: #000000;
 color: #CF8C44;
border: 1px solid #3E92B5;
border-radius: 10px;
font-size: 16px;
}
.description-input {
 flex: 3;
 padding: 6px 10px;
 max-width: 1700px;
 background-color: #000000;
 color: #CF8C44;
 border: 1px solid #3E92B5;
    border-radius: 10px;
font-size: 16px;
}

.add-button,.save_button{
background-color: #CF8C44;
color: #fff;
border-radius: 10px;
max-width: 500px;
padding: 6px 10px;
border: none;
font-size: 16px; 
}


.edit_button_input{
background-color: #000000;
border-radius: 10px;
max-width: 500px;
max-height:70px;
padding: 6px 10px;
border: none;
font-size: 16px; 
}

.delete_button_input{
background-color: #000000;
border-radius: 10px;
max-width: 500px;
max-height: 70px;
padding: 6px 10px;
border: none;
font-size: 16px; 
}

 
.name_edit, .description_edit{
flex: 1;
max-width: 150px;
padding: 6px 10px;
background-color: #000000;
 color: #CF8C44;
border: 1px solid #3E92B5;
border-radius: 10px;
font-size: 16px;
word-wrap: break-word;  
white-space: normal;
}

</style>
