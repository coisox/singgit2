<template>
	<div id="app" class="my-app">
    	<router-view :version="version" :categories="categories" :accounts="accounts"></router-view>
		<div class="my-glass"></div>
	</div>
</template>

<style>
	.my-app {
		width: 100vw;
		height: 100vh;
		margin: 0;
	}
	.my-header {
		position: fixed;
		width: 100vw;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 1rem 25px 1rem;
		color: white;
	}
	.my-container {
		position: fixed;
		width: 100%;
		height: calc(100vh - 56px);
		top: 56px;
		background-color: white;
		border-top-left-radius: 30px;
		border-top-right-radius: 30px;
		padding: 1rem 1rem 90px 1rem;
		z-index: 1;
	}
	.my-glass {
		position: fixed;
		width:100%;
		height: 90px;
		bottom: 0;
		background: linear-gradient(0deg, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%);
		z-index: 1;
	}
	.my-navigation {
		display: flex;
		position: fixed;
		bottom: 15px;
		left: 50%;
		transform: translateX(-50%);
		border-radius: 100px;
		z-index: 2;
		background: white;
	}
	.text-purple { color: #814ADF !important; }
	.text-muted { color: #BFBFBF !important; }
	.text-primary { color: #3763EB !important; }
	.text-success { color: #4BAF4F !important; }
	.text-danger { color: #F44336 !important; }
	.btn-primary.text-danger, .btn-primary .text-danger { color: #FFA5C4 !important; }
	.text-small { font-size: .7rem; }
	.btn-primary { background: linear-gradient(90deg, #3763EB 0%, #814ADF 100%) !important; border-color:transparent !important; }
	.btn-danger { background: linear-gradient(90deg, #FF2A55 0%, #F44336 100%) !important; border-color:transparent !important; }
	.btn-success { background: linear-gradient(90deg, #8BC24A 0%, #4BAF4F 100%) !important; border-color:transparent !important; }
	.btn-outline-secondary { border-color: #CED4DA !important; }
	.form-check-input:checked { background-color: #814ADF !important; }
	.swipeout-list { overflow: hidden; }
	.swipeout-action { width: 50px; display: flex; justify-content: center; align-items: center; }
	.swipeout .swipeout-left { left: -1px !important; }
	.swipeout .swipeout-right { right: -1px !important; }
	.swipeout-list-item + .swipeout-list-item { border-top: 1px solid #DEE2E6; }

	table { width:100%; }
	td { padding: .5rem 0 .5rem 1rem; }
	/* td:first-child { width: 1px; } */
	td:last-child { width: 80px; padding-left: 0; padding-right: 1rem; text-align: right; }
	.ellipsis-container { display: table; table-layout: fixed; width: 100%; }
</style>

<script>
	export default {
		name: "App",
		data() {
			return {
				version: 'V20210603',
				categories: ['Food', 'Other', 'Income', 'Rare', 'Transport', 'Service', 'Fixed', 'Transfer', 'Property'],
				accounts: ['Wallet', 'Credit Card', 'BIS', 'MBB', 'RHB', 'Loan'],
			}
		},
		mounted() {

		},
		methods: {
			
		}
	}
</script>