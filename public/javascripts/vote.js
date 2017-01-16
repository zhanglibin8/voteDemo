var url = window.location.href;
var indexReg = /index/;
var registerReg = /register/;
var detailReg = /detail/;
var searchReg = /search/;
var offset = 0;
var limit = 10;
var total = 0;
var loadMoreAction = true;
var sKey = 'userInfo';

var votefn = {
	/**
	 * [homeInit description] 首页初始化
	 * @return null
	 */
	homeInit: function() {
		var content = this
		this.manageUserInfo()
		this.voteManage()
		this.loadMoreFn()
		this.requestData('/vote/index/data?limit=' + limit + '&offset=' + offset, 'GET', function(data) {
			$('.coming').html(content.homeUserStr(data.data.objects))
			total = data.data.total
		})
		$('.search span').click(function(event) {
			window.location = '/vote/search?content=' + $('.search input').val()
		});
	},
	/**
	 * [homeInit description] 搜索页初始化
	 * @return null
	 */
	searchInit: function() {
		var contentStr = /content=([\w\W]*)/.exec(url)[1]
		var content = this
		this.manageUserInfo()
		this.voteManage()
		this.requestData('/vote/index/search?content=' + contentStr, 'GET', function(data){
			if (data.data.length) {
				$('.coming').html(content.homeUserStr(data.data))
			} else {
				$('.ndata').show()
			}			
		})
	},
	/**
	 * [homeInit description] 投票管理
	 * @return null
	 */
	voteManage: function() {
		var content = this
		$('.content').on('click', '.btn', function(event) {
			var userInfo = content.getStorage(sKey)
			var ele = event.target
			var voteEle = $(ele).siblings('.vote').children('span')
			var voteNum = parseInt($(voteEle).html())
			if (userInfo) {
				var selfId = userInfo.id
				var userId = $(ele).attr('userId')
				content.requestData('/vote/index/poll?id=' + userId + '&voterId=' + selfId, 'GET', function(data) {
					if (data.errno === 0) {
						$(voteEle).html(++voteNum + '票').addClass('bounceIn')
					} else {
						alert(data.msg)
					}
				})
			} else {
				$('.mask').show()
			}
		})

	},
	/**
	 * [homeInit description] 详情页页初始化
	 * @return null
	 */
	detailInit: function() {
		var content = this
		var detailId = /detail\/(\d*)/.exec(url)[1] 
		this.requestData(' /vote/all/detail/data?id=' + detailId, 'GET', function(data) {
			$('.personal').html(content.detailUserStr(data.data))
			$('.vflist').html(content.detailVfriendStr(data.data.vfriend))
		})
	},
	/**
	 * [homeInit description] 拼接详情页顶部的字符串
	 * @return String
	 */
	detailUserStr: function(obj) {
		var str = '<div class="pl">'
				+'	<div class="head">'
				+'		<img src="' + obj.head_icon + '" alt="">'
				+'	</div>'
				+'	<div class="p_descr">'
				+'		<p>' + obj.username + '</p>'
				+'		<p>编号#' + obj.id + '</p>'
				+'	</div>'
				+'</div>'
				+'<div class="pr">'
				+'	<div class="p_descr pr_descr">'
				+'		<p>' + obj.rank + '名</p>'
				+'		<p>' + obj.vote + '票</p>'
				+'	</div>'
				+'</div>'
				+'<div class="motto">'
				+'	' + obj.description + ''
				+'</div>'

		return str
	},
	/**
	 * [homeInit description] 详情页好友的字符串	
	 * @return Sring
	 */
	detailVfriendStr: function(arrs) {
		var str = ''
		for(var i = 0; i < arrs.length; i++) {
			str += '<li>'
				   +'<div class="head">'
				   +'     <a href="#"><img src="' + arrs[i].head_icon +'" alt=""></a>'
				   +' </div>'
				   +' <div class="up">'
				   +' 	<div class="vote">'
				   +' 		<span>投了一票</span>'
				   +' 	</div>'
				   +' </div>'
				   +' <div class="descr">'
				   +'     <h3>' + arrs[i].username +'</h3>'
				   +'     <p>编号#' + arrs[i].id +'</p>'
				   +' </div>'
				   +'</li>'
		}
		return str
	},
	/**
	 * [homeInit description] 用户信息管理
	 * @return null
	 */
	manageUserInfo: function() {
		var content = this
		var userInfo = this.getStorage(sKey)
		if (userInfo) {
			$('.register').html('个人主页')
			$('.register').click(function(event) {
				window.location = '/vote/detail/' + userInfo.id
			});
			$('.no_signed').hide()
			$('.username').html(userInfo.username)
			$('.sign_in span').html('退出登入')
		}

		$('.sign_in').click(function(event) {
			$('.mask').show()
		});
		$('.dropout').click(function(event) {
			content.deleteStorage(sKey)
			// window.location = url + '?v=' + Math.random()
			window.location.reload()
		});
		$('.mask').click(function(event) {
			if (event.target.className === 'mask') {
				$('.mask').hide()
			}
		});
		$('.subbtn').click(function(event) {
			var id = $('.usernum').val()
			var password = $('.user_password').val()
			if (!id || !password) {
				alert('提交信息不全！')
				return false
			}
			content.requestData('/vote/index/info', 'POST', function(data) {
				if (data.errno === 0) {
					content.setStorage(sKey, {
						username: data.user.username,
						id: data.id
					})
					window.location.reload();
				} else {
					alert(data.msg)
				}
			}, {
				password: password,
				id: id
			})
		});
	},
	/**
	 * [homeInit description] 加载更多
	 * @return null
	 */
	loadMoreFn: function() {
		var content = this
		loadMore({
			callback: function(load) {	
				offset = offset + limit
				if (offset < total) {
					content.requestData('/vote/index/data?limit=' + limit + '&offset=' + offset, 'GET', function(data) {
						/*延时是为了更好的演示效果*/
						setTimeout(function(){
						   $('.coming').append(content.homeUserStr(data.data.objects))
						    load.reset();  
						}, 1000)
					})
				} else {
					load.complete();
					/*延时是为了更好的演示效果*/
					setTimeout(function(){
					    load.reset(); 
					}, 1000)
				}				
			}
		})
	},
	/**
	 * [homeInit description] 存储本地方法
	 * @return null
	 */
	setStorage: function(key, obj) {
		localStorage.setItem(key, JSON.stringify(obj))
	},
	/**
	 * [homeInit description] 获取存储本地的内容
	 * @return null
	 */
	getStorage: function(key) {
		return JSON.parse(localStorage.getItem(key)) 
	},
	/**
	 * [homeInit description] 删除存储本地的内容
	 * @return null
	 */
	deleteStorage: function(key) {
		localStorage.removeItem(key)
	},
	/**
	 * [homeInit description] 报名的初始化
	 * @return null
	 */
	registerInit: function() {
		var content = this
		$('.rebtn').click(function(event) {
			var sendData = content.getRigsterData()
			if (sendData) {
				content.requestData('/vote/register/data', 'POST', function(data){
					alert(data.msg)
					if (data.errno === 0) {
						content.setStorage(sKey, {
							username: sendData.username,
							id: data.id
						})
						window.location = '/vote/index'
					} 
				}, sendData)
			}
		});
	},
	/**
	 * [homeInit description] 获取报名数据
	 * @return 用户填写数据
	 */
	getRigsterData: function() {
		var username = $('.username').val()
		var initial_password = $('.initial_password').val()
		var confirm_password = $('.confirm_password').val()
		var mobile = $('.mobile').val()
		var description = $('.description').val()
		var gender = 'boy'

		if (!username) {
			alert('请输入用户名')
			return false
		}
		if (!initial_password) {
			alert('请输入密码')
			return false
		}
		if (initial_password != confirm_password) {
			alert('两次密码输入不一致')
			return false
		}
		if (!/^\d{11}$/.test(mobile)) {
			alert('请输入正确格式的手机号码')
			return false
		}
		if (!description) {
			alert('请输入描述内容')
			return false
		}
		$('input[type=radio]')[0].checked ? gender = 'boy' : gender =  'girl'

		return  {
			username: username,
			mobile: mobile,
			description: description,
			gender: gender, 
			password: initial_password
		}
	},
	/**
	 * 请求方法
	 * @param  {[type]}   url  地址
	 * @param  {[type]}   type 请求方法
	 * @param  {Function} fn   回调函数
	 * @param  {[type]}   data 发送数据
	 * @return {[type]}        
	 */
	requestData: function(url, type, fn, data) {
		data = data || ''
		$.ajax({
			url: url,
			type: type,
			data: data,
			dataType: 'json',
			success: fn,
		})
	},
	/**
	 * 拼接首页用户字符串
	 * @param  {[type]} arrs 数组
	 * @return {[type]}      String
	 */
	homeUserStr: function(arrs) {
		var str = ''
		for(var i =0 ; i<arrs.length; i++) {
		  	str +=  '<li>'      
		            +'<div class="head">'
		            +'   <a href="/vote/detail/' + arrs[i].id + '" >'
		            +'      <img src="' + arrs[i].head_icon + '" alt="">'
		            +'   </a>'
		            +'</div>'
		            +'<div class="up">'
		            +'   <div class="vote">'
		            +'      <span>' + arrs[i].vote + '票</span>'
		            +'   </div>'
		            +'   <div class="btn" userId=' + arrs[i].id + '>'
		            +'      投TA一票'
		            +'   </div>'
		            +'</div>'
		            +'<div class="descr">'
		            +'  <a href="/vote/detail/' + arrs[i].id + '">'
		            +'     <div>'
		            +'        <span>' + arrs[i].username + '</span>'
		            +'        <span>|</span>'
		            +'        <span>编号#' + arrs[i].id + '</span>'
		            +'      </div>'
		            +'     <p>' + arrs[i].description + '</p>'
		            +'   </a>'
		            +'</div>'  
		           +'</li>'
		}
		return str
	}
}

$(document).ready(function($) {
	//url判断不同页面执行的js
	if (indexReg.test(url)) {
		votefn.homeInit()		
	} else if (registerReg.test(url)) {
		votefn.registerInit()
	} else if (detailReg.test(url)) {
		votefn.detailInit()
	} else if (searchReg.test(url)) {
		votefn.searchInit()
	}
});











