import React from 'react';
import { useParams, useNavigate, Link, useHistory } from 'react-router-dom';
import rocketicon from '../../assets/images/rocket-icon.svg'
import importicon from '../../assets/images/import-icon.svg'


function NewPodcast() {
  return (
    <div className="page-content" >
      <div className="container mobile-content-block">
        <div className="row">
          <div className="col-md-12 col-lg-12 m-auto">
            <div className="create-box bg-white">
              <div className="row row-eq-height">
                <div className="col-lg-6 col-md-6 dashed-border">
                  <div className="text-center h-100">
                    <div className="starter-icons">
                      <img src={rocketicon} alt="Create a new podcast rocket icon" />

                    </div>
                    <h4 className="text-success mt-4 show-creation-titles"> Create a new show
                    </h4>
                    <p className="show-creation-info"> You're ready to start creating your
                      awesome new show. We'll have you set up in a few minutes. </p>


                    {/* <button
                           type="button" name="create" className="btn btn-outline-primary"> Create a
                          New Podcast </button> */}

                    <Link to='/create/podcast'><button type="button" name="create" className="btn btn-outline-primary">Create a New Show</button></Link>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 mt-3 mt-md-0 mt-lg-0">
                  <div className="text-center h-100">
                    <div className="starter-icons">
                      <img src={importicon} alt="Import your podcast icon" className="import-icon" />
                    </div>
                    <h4 className="text-success mt-4 show-creation-titles"> Import your podcast
                    </h4>
                    <p className="show-creation-info"> Moving your podcast to Captivate? Sweet!
                      The process is free and easy, let's go! </p>

                    <Link to='/import/file'><button type="button" name="import" className="btn btn-outline-primary">Import Your Podcast</button></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>

    </div>
  );
}

export default NewPodcast;
