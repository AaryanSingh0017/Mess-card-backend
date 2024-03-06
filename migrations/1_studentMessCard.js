var StudentMessCard = artifacts.require('./StudentMessCard.sol')

module.exports = function(deployer) {
    deployer.deploy(StudentMessCard)
}