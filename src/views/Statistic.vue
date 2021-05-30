<template>
	<div>
		<div class="my-header">
			<span>Statistic {{month.format('MMM YYYY')}}</span>
		</div>
		<div class="my-container">
			<ul class="list-group">
				<li class="list-group-item d-flex justify-content-between btn-primary text-white">
					<span>Current Balance</span>
					<span :class="{'text-pink':balances_total<0}">{{toCurrency(balances_total)}}</span>
				</li>
				<li class="list-group-item bg-light d-none d-lg-block">
					<div class="row">
						<div class="col">Account</div>
						<div class="col text-end">Record</div>
						<div class="col text-end">Actual</div>
						<div class="col text-end">Diff</div>
					</div>
				</li>
				<li class="list-group-item" v-for="(amount, account) in balances" :key="account">
					<div class="row">
						<div class="col text-nowrap">{{account}}</div>
						<div class="col text-end" :class="{'text-danger':amount<0, 'text-success':amount>=0}">{{toCurrency(amount)}}</div>
						<div class="col d-none d-lg-block"><input type="number" step="0.01" class="w-100 text-end border-0 p-0" v-model="actual[account]" @change="saveToLS()" style="background:transparent;"></div>
						<div class="col d-none d-lg-block text-end" :class="{'text-danger':diff[account]<0, 'text-success':diff[account]>=0}">{{toCurrency(diff[account])}}</div>
					</div>
				</li>
			</ul>
			<ul class="list-group mt-3">
				<li class="list-group-item d-flex justify-content-between btn-primary text-white">
					<span>Income/Expenses</span>
					<span :class="{'text-pink':expenses_total<0}">{{toCurrency(expenses_total)}}</span>
				</li>
				<li class="list-group-item d-flex justify-content-between" v-for="item in expenses" :key="item.category" @click="gotoTransactions(item.category)">
					<span>{{item.category}}</span>
					<span :class="{'text-danger':item.amount<0, 'text-success':item.amount>=0}">{{toCurrency(item.amount)}}</span>
				</li>
			</ul>
		</div>

		<div class="my-navigation shadow px-2 border">
			<router-link class="p-3 text-purple" to="/form"><i class="bi bi-file-earmark-plus"></i></router-link>
			<router-link class="p-3 text-purple" to="/transactions"><i class="bi bi-journal-text"></i></router-link>
			<router-link class="p-3 text-purple" to="/statistic"><i class="bi bi-graph-up"></i></router-link>
			<a class="p-3 text-muted"><i class="bi bi-grip-vertical"></i></a>
			<a class="p-3 text-purple" @click="fetch(-1)"><i class="bi bi-backspace"></i></a>
			<a class="p-3 text-purple" @click="fetch(1)"><i class="bi bi-backspace-reverse"></i></a>
			<a class="p-3 text-purple" data-bs-toggle="modal" data-bs-target=".modal"><i class="bi bi-grid"></i></a>
		</div>

		<div class="modal fade" tabindex="-1">
			<div class="modal-dialog modal-sm">
				<div class="modal-content">
					<div class="modal-body">
						<button type="button" class="btn btn-primary w-100 mb-1" @click="backup('export_1_week')" :disabled="backup_progress" style="height:38px;"><div class="spinner-border spinner-border-sm" v-if="backup_progress"></div><span v-else>Export 1 Week</span></button>
						<button type="button" class="btn btn-primary w-100 mb-1" @click="backup('export_1_month')" :disabled="backup_progress" style="height:38px;"><div class="spinner-border spinner-border-sm" v-if="backup_progress"></div><span v-else>Export 1 Month</span></button>
						<button type="button" class="btn btn-primary w-100 mb-1" @click="backup('export_3_month')" :disabled="backup_progress" style="height:38px;"><div class="spinner-border spinner-border-sm" v-if="backup_progress"></div><span v-else>Export 3 Month</span></button>
						<button type="button" class="btn btn-primary w-100 mb-1" @click="backup('export_everything')" :disabled="backup_progress" style="height:38px;"><div class="spinner-border spinner-border-sm" v-if="backup_progress"></div><span v-else>Export Everything</span></button>
						<button type="button" class="btn btn-danger w-100" @click="backup('import')" :disabled="backup_progress" style="width:80px; height:38px;"><div class="spinner-border spinner-border-sm" v-if="backup_progress"></div><span v-else>Import</span></button>
					</div>
				</div>
			</div>
		</div>

	</div>
</template>

<style scoped>
	
</style>

<script>
	import moment from 'moment'
	require('isomorphic-fetch')

	export default {
		data() {
			return {
				month: moment(),
				balances: {},
				balances_total: 0,
				expenses: [],
				expenses_total: 0,
				backup_progress: false,
				actual: {},
				change: 0,
			}
		},
		props: ['version', 'categories', 'accounts'],
		computed: {
			diff: function() {
				this.change.length //dummy to trigger change

				var r = {}
				for(var account in this.balances) {
					r[account] = this.balances[account] - this.actual[account]
				}

				return this.fixDecimal(r)
			}
		},
		methods: {
			backup: function(type) {
				var me = this
				me.backup_progress = true

				console.log('backup....')

				var Dropbox = require('dropbox').Dropbox
				var dbx = new Dropbox({ accessToken: 'gLb9sbW8xDgAAAAAAAADyIxcjH6QBxbYI7o6qWl31VQweZV2b1U7MEcrq9X-hh6c' })

				if(type=='import') {
					dbx.filesDownload({path:'/transactions.json'}).then(function(response) {
						var blob = response.result.fileBlob
						var reader = new FileReader()
						reader.addEventListener("loadend", function() {
							var data = JSON.parse(reader.result)
							var row = []

							data.forEach((i, index)=>{
								var r = {
									account_from: i.account_from,
									account_to: i.account_to,
									amount: i.amount,
									amount_string: i.amount.toFixed(2),
									category: i.category,
									date: i.date,
									description: i.description,
									tag: i.tag,
									updated_date: i.updated_date || i.date,
									deleted: i.deleted || 0
								}
								if(i.id || i.id===0) r.id = i.id
								if(r.account_from=='Loan' || r.account_to=='Loan') r.category = 'Transfer'
								row.push(tbl_transactions.createRow(r))
							})

							//=================================================================================== fresh import
							db.insertOrReplace().into(tbl_transactions).values(row).exec().then(function(results) {
								me.backup_progress = false
								me.getBalances()
								me.fetch()
							})

						})
						reader.readAsText(blob)
					}).catch(function(error) {
						console.log(error)
					})
				}
				else {
					var backup_since = ''
					if(type=='export_1_week') backup_since = moment().add(-1, 'weeks').format('YYYY-MM-DD')
					else if(type=='export_1_month') backup_since = moment().add(-1, 'months').format('YYYY-MM-DD')
					else if(type=='export_3_month') backup_since = moment().add(-3, 'months').format('YYYY-MM-DD')
					else if(type=='export_everything') backup_since = '2000-01-01'

					db.
						select().
						from(tbl_transactions).
						where(tbl_transactions.updated_date.gte(backup_since)).
						orderBy(tbl_transactions.date, lf.Order.ASC).
						exec().
					then(function(results) {
						
						//backup current dump since we are going to replace it
						dbx.filesCopyV2({
							from_path: '/transactions.json',
							to_path: '/transactions '+moment().format('YYYYMMDD HHmm')+'.json'
						}).then(function(response) {
							
							//replace current dump file
							dbx.filesUpload({path:'/transactions.json', contents:JSON.stringify(results), mode:'overwrite', mute:true}).then(function(response) {
								me.backup_progress = false
							})
						})
					})
				}
			},
			toCurrency: function(n) {
				return new Intl.NumberFormat('en-US', {
					minimumFractionDigits: 2
				}).format(Math.abs(n))
			},
			fixDecimal: function(obj) {
				if(typeof obj == 'object') {
					for(var key in obj) {
						obj[key] = obj[key].toFixed(2)*1
					}
				}
				else if(typeof obj == 'number') {
					obj = obj.toFixed(2)*1
				}
				else if(typeof obj == 'string') {
					obj = Number(obj).toFixed(2)*1
				}

				return obj
			},
			getBalances: function() {
				var me = this
				if(!window['db']) { setTimeout(() => { me.getBalances() }, 1); return; } //wait until db ready

				me.accounts.forEach(i=>{ me.balances[i] = 0 })
				me.balances_total = 0

				db.select().from(tbl_transactions).where(tbl_transactions.deleted.neq(1)).exec().then(function(results) {

					// var debug = []
					results.forEach(row=>{
						
						if(row.category!='Transfer') {
							me.balances[row.account_from] += row.amount
							me.balances_total += row.amount
							
							if(!row.account_from) console.log('Problem Data Non Transfer: ', row)
						}
						else {
							me.balances[row.account_from] -= row.amount
							me.balances[row.account_to] += row.amount

							if(!row.account_from || !row.account_to) console.log('Problem Data Transfer: ', row)
						}

						// if(row.account_from=='Credit Card' || row.account_to=='Credit Card') debug.push(row)
					})

					// console.log(JSON.stringify(debug))

					me.fixDecimal(me.balances)
					me.balances_total = me.fixDecimal(me.balances_total)
				})
			},
			fetch: function(p = 0) {
				var me = this
				if(!window['db']) { setTimeout(() => { me.fetch() }, 1); return; } //wait until db ready

				me.month = me.month.add(p, 'months')
				db.
					select(tbl_transactions.category, lf.fn.sum(tbl_transactions.amount).as('amount')).
					from(tbl_transactions).
					where(
						lf.op.and(
							tbl_transactions.deleted.neq(1),
							tbl_transactions.category.neq('Transfer'),
							tbl_transactions.category.neq(''),
							tbl_transactions.date.gt(me.month.format('YYYY-MM')),
							tbl_transactions.date.lt(me.month.format('YYYY-MM-99'))
						)
					).
					groupBy(tbl_transactions.category).
					exec().
				then(function(results) {
					me.expenses = results
					me.expenses_total = me.fixDecimal(results.reduce((t,i)=>{return t+i.amount}, 0))
				})
			},
			gotoTransactions: function(category) {
				this.$router.push({
					name: 'transactions',
					params: {
						filter_date_from: this.month.startOf('month').format('YYYY-MM-DD'),
						filter_date_to: this.month.endOf('month').format('YYYY-MM-DD'),
						filter_category: category
					}
				})
			},
			saveToLS: function() {
				localStorage.setItem('Statistic_actual', JSON.stringify(this.actual))
				this.change++
			}
		},
		mounted() {
			var me = this
			this.getBalances()
			this.fetch()

			//to stick my entry even refresh
			var Statistic_actual = JSON.parse(localStorage.getItem('Statistic_actual') || '{}')
			this.accounts.forEach(i=>{ me.actual[i] = Statistic_actual[i] || 0 })
		}
	}
</script>