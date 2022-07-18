import React, { useEffect, useState } from "react";
import { api } from "../../Services/api";
import "./Profiles.css";
import iconChat from "../assets/iconChat.svg";
import friends from "../assets/friends.svg";
import notificar from "../assets/notificar.svg";
import solicitar from "../assets/solicitar.svg";
import { logout } from '../../Services/utils';
import { NavLink, useHistory } from 'react-router-dom';

export default function Profiles() {

  const [profiles, setProfiles] = useState();
  const [currentProfile, setCurrentProfile] = useState();
  const [message, setMessage] = useState();
  const [currentInvitedProfile, setCurrentInvitedProfile] = useState();
  const [invites, setInvites] = useState();
  const [inviteAccept, setInviteAccept] = useState(false);
  //const [contacts, setContacts] = useState();

  useEffect(() => {
    api.get('/perfil/')
    .then((resp) => setCurrentProfile(resp.data))
    .catch((error) => console.error(error));

    api
    .get('/perfis/')
    .then((resp) => {
        setProfiles(resp.data)

        const tempProfiles = resp.data;
    
        api.get('/convites/')
        .then(resp => {
            const invitesInfo = resp.data.map((invite) => {
                const profile = tempProfiles?.find((profile) => invite.solicitante === profile.id);

                return { ...profile, inviteId: invite.id };
            });

            setInvites(invitesInfo);
        })
        .catch((error) => console.error(error));
    })
    .catch((error) => console.error(error));

  }, [inviteAccept]);

  function invite(id){
    api.post(`/convites/convidar/${id}`)
    .then((resp) => setMessage(resp.data.messagem))
    .catch((error) => console.error(error));

    setCurrentInvitedProfile(id);
  }

  function accept(id) {
    api
      .post(`/convites/aceitar/${id}`)
      .then((resp) => {
        console.log(resp);
        setInviteAccept(!inviteAccept);
    })
      .catch((error) => console.error(error));
  }

  const history = useHistory();
  
  function handleLogout() {
    logout();
    history.push("/");
  }


  return (
  <>
  <nav className="navBar">
        <div className="tituloProfile">
            <h1>Simple Chat</h1>
            <img src={iconChat}/>
        </div>
        <ul className="navLi">
        <h4>{currentProfile?.nome} </h4>
            <li>
                <NavLink exact to="/">
                    Login   
                </NavLink>
            </li>
            <li>
                <NavLink exact to="/register">
                    Register
                </NavLink>
            </li>            
        </ul>
        <button className="btnProfile"  onClick={handleLogout}>Sign out</button>
  </nav>
  
    <div className="profiles">
        <div className="invite">
            <div className="friends">
                <h2>Solicitar amizade</h2>
                <img src={solicitar}/>
            </div>
            
            {profiles?.map((profile) =>  
                profile.id === currentProfile?.id ? null : (
                    <div key={profile.id}>
                        <div className="card">
                            <h3>{profile.nome}</h3>
                            <span>{profile.email}</span><br/>
                            {profile.pode_convidar ? <button className="icon" title="convidar"  onClick={() => invite(profile.id)}> Convidar</button> : null}
                        </div>
                        {profile.id === currentInvitedProfile ? <span className="message">{message}</span> : null}
                    </div>
                ),
            )}
        </div>

        <div className="invitations">
            <div className="friends">
                <h2>Convites</h2>
                <img src={notificar}/>
            </div>
            {invites?.map((item) => (
                <div className="card-default card" key={item.inviteId}>
                    <h3>{item.nome}</h3>
                    <button onClick={() => accept(item.inviteId)}>Aceitar</button>
                </div>
            ))}
        </div>

        <div className="contacts">
            <div className="friends">
                <h2>Amigos</h2>
                <img src={friends}/>
            </div>
            
            <ul className="contact">
                {currentProfile?.contatos.map(contact => (
                    <li className="card-default card" key={contact.id}>
                        <h3>{contact.nome}</h3>
                        <span>{contact.email}</span>
                    </li>
                ))}
            </ul>

        </div>
    </div>
  </>
  );
}
