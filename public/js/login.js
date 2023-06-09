axios.defaults.withCredentials = true;

const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:3000/api/v1/user/login",
      data: {
        email,
        password,
      },
    });

    if (res.data.status === "success") {
      alert("You are logged in man or women or nowdays whatever");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
    console.log(res.data);
  } catch (err) {
    alert(err)
  }
};

document.querySelector(".form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  login(email, password);
});
