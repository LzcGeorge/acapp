class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if(this.root.AcWingOS) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";

        this.$settings = $(`
            <div class = "game-settings">
                <div class="game-settings-login">
                    <div class="game-settings-title">登录</div>
                     <div class="game-settings-username">
                        <div class="game-settings-item">
                            <input type="text" placeholder="用户名">
                        </div>
                    </div>
                    <div class="game-settings-password">
                        <div class="game-settings-item">
                            <input type="password" placeholder="密码">
                        </div>
                    </div>
                    <div class="game-settings-submit">
                        <div class="game-settings-item">
                            <button>登录</button>
                        </div>
                    </div>
                    <div class="game-settings-error-message">
                        
                    </div>
                    <div class="game-settings-option">
                        注册
                    </div>
                    <br>
                    <div class="game-settings-acwing">
                        <img width="30" src="https://app4504.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
                   
                        <div>
                            一键登录
                        </div>                       
                    </div>
                </div>
                
                <div class="game-settings-register">
                
                    <div class="game-settings-title">注册</div>
                         <div class="game-settings-username">
                            <div class="game-settings-item">
                                <input type="text" placeholder="用户名">
                            </div>
                        </div>
                        <div class="game-settings-password game-settings-password-first">
                            <div class="game-settings-item">
                                <input type="password" placeholder="密码">
                            </div>
                        </div>
                        <div class="game-settings-password game-settings-password-second">
                            <div class="game-settings-item">
                                <input type="password" placeholder="确认密码">
                            </div>
                        </div>
                        <div class="game-settings-submit">
                            <div class="game-settings-item">
                                <button>注册</button>
                            </div>
                        </div>
                        <div class="game-settings-error-message">
                            
                        </div>
                        <div class="game-settings-option">
                            登录
                        </div>
                        <br>
                        <div class="game-settings-acwing">
                            <img width="30" src="https://app4504.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
                       
                            <div>
                                一键登录
                            </div>                       
                        </div>
                
                </div>
            </div>
        `);

        this.$login = this.$settings.find(".game-settings-login");
        this.$login_username = this.$login.find(".game-settings-username input");
        this.$login_password = this.$login.find(".game-settings-password input");
        this.$login_submmit = this.$login.find(".game-settings-submit button");
        this.$login_error_message = this.$login.find(".game-settings-error-message");
        this.$login_register = this.$login.find(".game-settings-option");
        this.$login.hide();

        this.$register = this.$settings.find(".game-settings-register");
        this.$register_username = this.$register.find(".game-settings-username input")
        this.$register_password = this.$register.find(".game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".game-settings-password-second input");
        this.$register_submit = this.$register.find(".game-settings-submit button");
        this.$register_error_message = this.$register.find(".game-settings-error-message");
        this.$register_login = this.$register.find(".game-settings-option");
        this.$register.hide();

        this.$acwing_login = this.$settings.find(".game-settings-acwing img")

        this.root.$ac_game.append(this.$settings);
        this.start();
    }

    start() {
        if(this.platform === "ACAPP") {
            this.getinfo_acapp();

        } else {
            if(this.root.access) {
                this.getinfo_web();
                this.refresh_jwt_token();
            } else {
                this.login();
            }
            this.add_listening_enents();
        }

    }

    refresh_jwt_token() {
        setInterval(() => {
            $.ajax({
                url: "https://app4504.acapp.acwing.com.cn/settings/token/refresh/",
                type: "post",
                data: {
                    refresh: this.root.refresh,
                },
                success: resp => {
                    this.root.access = resp.access;
                    console.log(resp);
                }
            });
        },4.5 * 60 * 1000);

        setTimeout(() => {
            $.ajax({
                url: "https://app4504.acapp.acwing.com.cn/settings/ranklist/",
                type: "get",
                headers: {
                    'Authorization': "Bearer " + this.root.access,
                },
                success: resp => {
                    console.log(resp);
                }
            });
        },5000);
    }
    add_listening_enents() {
        let outer = this;
        this.add_listening_enents_login();
        this.add_listening_enents_register();
        
        this.$acwing_login.click(function () {
            outer.acwing_login();
        })
    }

    add_listening_enents_login() {
        let outer = this;
        this.$login_register.click(function () {
            outer.register();
        });
        this.$login_submmit.click(function () {
           outer.login_on_remote();
        });
    }
    add_listening_enents_register() {
        let outer = this;
        this.$register_login.click(function () {
            outer.login();
        });
        this.$register_submit.click(function () {
            outer.register_on_remote();
        });
    }

    acwing_login() {
        $.ajax({
            url: "https://app4504.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function (resp){
                if(resp.result === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        })
    }

    login_on_remote(username,password) { // 在远程服务器上登录
        username = username || this.$login_username.val();
        password = password || this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
           url: "https://app4504.acapp.acwing.com.cn/settings/token/",
            type: "post",
            data: {
               username: username,
               password: password,
            },
            success: resp => {
               console.log(resp);
               this.root.access = resp.access;
               this.root.refresh = resp.refresh;
               this.refresh_jwt_token();
               this.getinfo_web();
            },
            error: () => {
                this.$login_error_message.html("用户名或密码错误");
            }
        });
    }

    register_on_remote() { // 在远程服务器上注册
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://app4504.acapp.acwing.com.cn/settings/register/",
            type: "post",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: resp => {
                if(resp.result === "success") {
                    this.login_on_remote(username,password);
                } else {
                    this.$register_error_message.html(resp.result);
                }
            }
        })
    }

    logout_on_remote() { // 在远程服务器上退出
        if(this.platform === "ACAPP") {
            this.root.AcWingOS.api.window.close();
        } else {
           this.root.access = "";
           this.root.refresh = "";
           location.href = "/";
        }


    }

    login() { // 打开登录页面
        this.$register.hide();
        this.$login.show();
    }

    register() { // 打开注册页面
        this.$login.hide();
        this.$register.show();
    }
    acapp_login(appid,redirect_uri,scope,state) {
        let outer = this;
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function (resp) {

            console.log("called from acapp_login function");
            if(resp.result === "success") {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.sex = resp.sex;
                outer.hide();
                outer.root.menu.show();
                console.log(resp);
                outer.root.access = resp.access;
                outer.root.refresh = resp.refresh;
                outer.refresh_jwt_token();
            }
        });
    }
    getinfo_acapp() {
        let outer = this;
        $.ajax({
            url: "https://app4504.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function (resp) {
                if(resp.result === "success") {
                    outer.acapp_login(resp.appid,resp.redirect_uri,resp.scope,resp.state);
                }
            }
        });
    }
    getinfo_web() {
        let outer = this;
        $.ajax({
            url : "https://app4504.acapp.acwing.com.cn/settings/getinfo/",
            type: "get",
            data: {
                platform: outer.platform,
            },
            headers: {
              'Authorization': "Bearer " + this.root.access,
            },
            success: function (resp) {  // response 简写
                if(resp.result === "success") {
                    console.log(resp);
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.sex = resp.sex;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
        })
    }

    hide() {
        this.$settings.hide();
    }
    show() {
        this.$settings.show();
    }
}