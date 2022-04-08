const importExcel = require('convert-excel-to-json');
const del = require('del');
const {initializeApp} = require('firebase/app')
const fs = require('fs')
const {	
		getFirestore, collection, onSnapshot,
		addDoc, deleteDoc, doc, setDoc ,query, where,
		orderBy, serverTimestamp, getDoc,updateDoc
} = require('firebase/firestore')

const {	
				getAuth, createUserWithEmailAndPassword,
				signOut, signInWithEmailAndPassword
} = require('firebase/auth')


const firebaseConfig = {
  apiKey: "AIzaSyA8gEv2yqa2r93owyqy8i1v2xuKn2MgngM",
  authDomain: "reminderapps-9974e.firebaseapp.com",
  projectId: "reminderapps-9974e",
  storageBucket: "reminderapps-9974e.appspot.com",
  messagingSenderId: "451234794151",
  appId: "1:451234794151:web:bd4cf1fea79a547038e982"
};

// init firebase
initializeApp(firebaseConfig)

// init services
const db = getFirestore();
const auth = getAuth()


//==================================== GET DATA AGENDA =================================

exports.getData = async (req,res) =>{
	// collection ref
	const colRef = collection(db,'Agenda');

	console.log("get Data")
	
	// queries
	const q = query(colRef, orderBy('tanggalAgenda','desc'))

	
	let response = res;
	
	// real time collection data
	await onSnapshot(q,response,async(snapshot) => {
		let Agenda = []

		await snapshot.docs.forEach((doc)=>{
			Agenda.push({...doc.data(),id:doc.id});
		})

		let data = {
	 		jadwal : Agenda
		}

		console.log(Agenda)
		await fs.writeFileSync('agenda.json', JSON.stringify(data, null, 2));

	});



	let data_send = await fs.readFileSync('./agenda.json', 'utf-8');
  data_send = await JSON.parse(data_send);
	res.status(200).json(data_send);
	res.end()
}


//==================================== ADD DATA AGENDA =================================

exports.addData = async (req,res) =>{
	// collection ref
	const colRef = collection(db,'Agenda');

	let data = req.body;

	// add data to firebase
	await addDoc(colRef,data)
	.then(() => {
		console.log("berhasil di tambahkan")
	})

	await res.status(200).json({msg:"Berhasil Menambahkan Data"});
	await res.end();
}


//============================== UPDATE DATA AGENDA ===============================
exports.updateData = async(req,res) =>{
		console.log(req.body)	

		let data = {
			kegiatan : req.body.kegiatan,
			tanggal : req.body.tanggal,
			penulis : req.body.penulis,
			deskripsi : req.body.deskripsi,
		}

		const docRef = doc(db,'Agenda',req.body.id);

		await updateDoc(docRef,data)
		.then(() => {
				console.log("berhasil di perbarui")
		})


	await res.status(200).json({msg:"Berhasil Memperbarui Data"});
	await res.end();

}


//============================== DELETE DATA AGENDA ===============================
exports.deleteData = async (req,res) =>{
	let data = req.body.id;
	console.log(data)
	for(let i=0;i<data.length;i++){
		const docRef = doc(db,'Agenda',data[i]);
		deleteDoc(docRef)
		.then(() => {
			console.log("Berhasil Menghapus data dengan id : "+data[i]);
		})
	}

	setTimeout(()=>{
		res.status(200).json({msg:"Berhasil Menghapus Data"});
		res.end();
	},2000)
}




//==================================== GET DATA AKUN =================================

exports.getDataAkun = async (req,res) =>{
	// collection ref
	const colRef = collection(db,'Akun');

	console.log("get Data")
	
	// queries
	const q = query(colRef, orderBy('dibuat','desc'))

	let response = res;
	
	// real time collection data
	await onSnapshot(q,response,async(snapshot) => {
		let akun = []

		await snapshot.docs.forEach((doc)=>{
			akun.push({...doc.data(),id:doc.id});
		})

		let data = {
	 		akun : akun
		}

		await fs.writeFileSync('akun.json', JSON.stringify(data, null, 2));

	});



	let data_send = await fs.readFileSync('./akun.json', 'utf-8');
  	data_send = await JSON.parse(data_send);
	res.status(200).json(data_send);
	res.end()
}


//==================================== ADD DATA AKUN =================================

exports.addDataAkun = async (req,res) =>{
	// collection ref
	const colRef = collection(db,'Akun');

	let data = req.body;
	data.dibuat = serverTimestamp() 

	console.log(data)

	// register akun
	let u = data.username+"@grf.com"
	let p = data.password
	let credensial;
	await createUserWithEmailAndPassword(auth,u,p)
		.then((cred)=>{credensial = cred.user})
	
	// add data to firebase

	await setDoc(doc(db, "Akun", credensial.uid), data)
	.then(() => {
		console.log("berhasil di tambahkan")
	})
	.catch((err)=>{
		console.log(err)
	})


	await res.status(200).json(credensial);
	await res.end();
}


//============================== UPDATE DATA AKUN ===============================
exports.updateDataAkun = async(req,res) =>{
		console.log(req.body)	

		let data = {
			username : req.body.username,
			password : req.body.password,
			name : req.body.name,
			role : req.body.role,
		}

		const docRef = doc(db,'Akun',req.body.id);

		await updateDoc(docRef,data)
		.then(() => {
				console.log("berhasil di perbarui")
		})


	await res.status(200).json({msg:"Berhasil Memperbarui Data"});
	await res.end();

}


//============================== DELETE DATA AKUN ===============================
exports.deleteDataAkun = async (req,res) =>{
	let data = req.body.id;
	console.log(data)
	for(let i=0;i<data.length;i++){
		const docRef = doc(db,'Akun',data[i]);
		deleteDoc(docRef)
		.then(() => {
			console.log("Berhasil Menghapus data dengan id : "+data[i]);
		})
	}

	setTimeout(()=>{
		res.status(200).json({msg:"Berhasil Menghapus Data"});
		res.end();
	},2000)
}


exports.convertAkun = async (req,res) =>{

   let file = req.files.filename;
   let filename = file.name;
   await file.mv('./excel/' + filename, async (err) => {
        if (err) {
            res.send('maaf file tidak bisa diupload ');
        } else {
            let result = importExcel({
                sourceFile: './excel/' + filename
            });

          
            let dataAccount = result.Sheet1;
		
            let time = 2000;
			let count = 1;
			let array_akun = []
			let akun;
			for (let i=0; i<dataAccount.length; i++) {
				console.log(i)
				akun = {
					username : null,
					password : null,
					name : null,
					role :null
				}

				akun.username = dataAccount[i].A                         
				akun.password = dataAccount[i].B                         
				akun.name = dataAccount[i].C                         
				akun.role = dataAccount[i].D
				akun.dibuat = serverTimestamp()
				
				array_akun.push(akun)

				console.log(akun.name);
            }

			console.log(array_akun)

			for(let i=0;i<array_akun.length;i++){
				console.log(array_akun[i])

				setTimeout(()=>{
					cAkun(array_akun[i])
					console.log("menjalan tambah ke :"+ count)
				},time)

				count++
				time+=3000;
			}


            del(['excel/' + filename]).then(paths => { console.log('file berhasil dihapus') });
            res.end();
        }
    });

   	await res.redirect("http://localhost:3000/dashboard1.html");
		await res.end();
}


const cAkun = async (akun) => {
	const db = getFirestore();
	const auth = getAuth()
	const colRef = collection(db,'Akun');

	// register akun
	let u = akun.username+"@grf.com"
	let p = akun.password
	let uid;

	console.log(akun.name)
	await createUserWithEmailAndPassword(auth,u,p)
	.then((cred)=>{
		uid = cred.user.uid
		console.log(uid);
		console.log("berhasil membuat akun : "+uid)
	})

	await setDoc(doc(db,"Akun",uid), akun)
	.then(() => {
		console.log(akun.name+" berhasil di tambahkan")
	})	
}


exports.login = async (req,res) =>{
	// collection ref
	const colRef = collection(db,'Akun');
	
	// queries
	const q = query(colRef, orderBy('dibuat','desc'))

	let response = res;
	
	// real time collection data
	await onSnapshot(q,response,async(snapshot) => {
		let akun = []

		await snapshot.docs.forEach((doc)=>{
			akun.push({...doc.data(),id:doc.id});
		})

		let data = {
	 		akun : akun
		}

		await fs.writeFileSync('akun.json', JSON.stringify(data, null, 2));

	});

	let data = fs.readFileSync('akun.json', 'utf-8')
		data = JSON.parse(data)
		data = data.akun;

	console.log(data);

	let login = false;

	for(let i=0;i<data.length;i++){
		if(data[i].username == req.body.username
			&& data[i].password == req.body.password){
			if(data[i].role == "Admin"){
				login = true;
			}	
		}
	}


	if(login){
		res.redirect('dashboard.html');
	}else{
		res.redirect('index.html');
	}

	res.end();
}