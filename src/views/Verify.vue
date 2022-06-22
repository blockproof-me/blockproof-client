<template>
  <div class="container">
    <img src="/img/logo.png" class="cover-img" />
    <div class="flex-container" v-if="urlValid">
      <p class="heading">Hello! Your provider has asked you to verify address</p>
      <p class="paramData">{{ params.address }}</p>
      <p class="heading">by signing the following message</p>
    <div class="sign-data-container">
      <div id="data_to_sign" class="paramData">{{ params.data_to_sign }} </div>
      <div
        class="btn"
        data-clipboard-target="#data_to_sign"
        :data-clipboard-text="params.data_to_sign"
      >
        <img class="clippy" src="/img/clippy.svg" width="13" alt="Copy to clipboard" />
        <span class="tooltiptext">Copied!</span>
      </div>
    </div>
      <p class="heading">Enter signed message here:</p>
      <div
        class="c-btn"
        @click="onSubmit"
        v-on:keyup.enter="onSubmit"
        ref="submit_button"
      >
        <textarea
          v-on:click.prevent.stop="false"
          ref="submit_text"
          autofocus
          class="sign-input"
          v-model="signed_data"
          type="text"
          rows="2"
          columns="64"
          maxlength="128"
        ></textarea>
      </div>
      <div ref="loader" class="lds-dual-ring"></div>
      <p class="status-text">{{ statusText }}</p>
    </div>
    <div class="flex-container" v-if="!urlValid">
      <p class="heading2">
        It appears that link you've followed here is malformed.<br />
        Please, check back with the link provider and try again.
      </p>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
//import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: "Verify",
  // components: {
  //   HelloWorld
  // }
  data() {
    return {
      signed_data: "",
      queryString: "",
      urlValid: false,
      params: {},
      statusText: "",
      startingCss: {},
    };
  },
  mounted() {
    //filter query params just in case someone messed with them
    const params = (({
      address,
      api_signature,
      callback_endpoint,
      data_to_sign,
      days,
      nonce,
      tx_count,
      txo_sum,
    }) => ({
      address,
      api_signature,
      callback_endpoint,
      data_to_sign,
      days,
      nonce,
      tx_count,
      txo_sum,
    }))(this.$route.query);
    if (
      params.address == null ||
      params.api_signature == null ||
      params.callback_endpoint == null ||
      params.data_to_sign == null
    ) {
    } else {
      this.urlValid = true;
    }
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key])
    //recreate query string which will be submitted with POST request
    this.queryString = new URLSearchParams(params).toString();
    this.params = params;
  },
  methods: {
    onSubmit: function () {
      this.submitCssState();
      
      fetch("https://api.blockproof.me/api/v1/verify_challenge?" + this.queryString, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'signed_data': this.signed_data})
      })
        .then((res) => res.json())
        .then((res) => {
          this.signed_data = "";
          console.log(res)
          if (res['result']['valid']) {
            this.onSuccess(res);
          } else {
            this.onFail(res);
          }
        })
        .catch(this.onFail);
    },
    onSuccess: function (res) {
      setTimeout(() => {
        this.$refs["loader"].style.opacity = "0";
        this.statusText = "Success! Redirecting you back...";
        setTimeout(() => {
          window.location.href = res['result']["callback_url"];
        }, 1000);
      }, 1000);
    },
    onFail: function (res) {
      setTimeout(() => {
        this.$refs["loader"].style.opacity = "0";
        setTimeout(() => {
          this.startingCssState();
          this.statusText =
            "We couldn't validate your signature. Make sure you signed the data with the correct address.";
        }, 1000);
      }, 1000);
    },
    startingCssState() {
      this.$refs["submit_button"].style = this.startingCss["submit_button"];
      this.$refs["submit_text"].style = this.startingCss["submit_text"];
      this.$refs["loader"].style = this.startingCss["loader"];
    },
    submitCssState() {
      this.statusText = "";
      this.$refs["submit_button"].style.width = 0;
      setTimeout(() => {
        this.startingCss["submit_button"] = this.$refs["submit_button"].style;
        this.startingCss["submit_text"] = this.$refs["submit_text"].style;
        this.startingCss["loader"] = this.$refs["loader"].style;
        let height = this.$refs["submit_button"].clientHeight;
        this.$refs["submit_button"].style.transition = "none";
        this.$refs["submit_text"].style.transition = "none";
        this.$refs["submit_text"].style.padding = 0;
        this.$refs["submit_button"].style.padding = 0;
        this.$refs["submit_button"].style.height = 0;
        this.$refs["loader"].style.display = "inline-block";
        this.$refs["loader"].style.visibility = "visible";
        this.$refs["loader"].style.opacity = "1";
        this.$refs["loader"].style.width = height + "px";
        this.$refs["loader"].style.height = height + "px";
      }, 210);
    }
  },
};
</script>

<style>
p {
  margin: 0.3em;
}
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 15px;
}
.flex-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.heading {
  color: #222;
  font: 1.8rem Inconsolata, monospace;
  text-align: center;
}
.heading2 {
  color: #222;
  font: 1.8rem Inconsolata, monospace;
  text-align: center;
}
.sign-input {
  font: 14pt Inconsolata, monospace;
  text-shadow: 0 0 5px #c8c8c8;
  display: inline-block;
  color: #fff;
  background-color: #222;
  padding: 0.9em 1.5em;
  border: none;
  outline: none;
  -webkit-transition: all 0.2s linear;
  -moz-transition: all 0.2s linear;
  transition: all 0.2s linear;
  text-align: left;
  width: 100%;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}

.c-btn {
  cursor: pointer;
  display: flex;
  align-items: stretch;
  padding-right: 48px;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
  width: 500px;
  border: none;
  background-color: #333;
  color: #fff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7.41' height='12' viewBox='0 0 7.41 12'%3E%3Cpath d='M10,6,8.59,7.41,13.17,12,8.59,16.59,10,18l6-6Z' transform='translate(-8.59 -6)' fill='%23fff'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 24px center;

  transition: all 0.2s linear;
}

textarea {
  resize: none;
  overflow: hidden;
  text-align: center;
}

.sign-input:hover {
  background-color: #333;
}

.paramData {
  background-color: #333;
  border-color: #333;
  border-radius: 4px;
  padding: 10px 20px;
  color: #fff;
  font: 1em Inconsolata, monospace;
  text-shadow: 0 0 5px #c8c8c8; 
  word-break: break-all;
  overflow-wrap: break-word;
}

#subscribe-button {
  width: 35px;
  height: 35px;
  border: none;
  text-indent: -9999px;
  opacity: 0.25;
  background-size: 13px;
  background-position: 0 1px;
  -webkit-transition: all 0.2s linear;
  -moz-transition: all 0.2s linear;
  transition: all 0.2s linear;
  background-size: 33px;
  cursor: pointer;
  display: inline-block;
}
#subscribe-button:hover {
  opacity: 0.33;
}

.cover-img {
  width: 100%;
  max-width: 767px;
  margin-top: 100px;
}

.btn {
  position: relative;
  display: inline-block;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 700;
  line-height: 20px;
  color: #333;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  background-color: #eee;
  background-image: linear-gradient(#fcfcfc, #eee);
  border: 1px solid #d5d5d5;
  border-radius: 3px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-appearance: none;
  margin-left: 10px;
}

.clippy {
  margin-top: -3px;
  position: relative;
  top: 3px;
}

.tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black;
}

.tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}

.lds-dual-ring {
  display: inline-block;
  opacity: 0;
  transition: visibility 1s, opacity 1s linear;
  width: 50px;
  height: 50px;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 64px;
  height: 64px;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid #333;
  border-color: #333 transparent #333 transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.status-text {
  color: #222;
  font: 1rem Inconsolata, monospace;
  text-align: center;
}

@media only screen and (max-width: 600px) {
  .sign-input {
    width: 70%;
  }
  .c-btn {
    width: 70%;
  }
  textarea {
    height: 4.5em;
  }
}

.sign-data-container{
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
}
</style>
